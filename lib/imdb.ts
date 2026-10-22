import { DataExchangeClient, SendApiAssetCommand } from "@aws-sdk/client-dataexchange";

export type ImdbTitle = {
  imdbId: string;
  title: string;
  originalTitle?: string;
  type: "MOVIE" | "SERIES" | "ANIME";
  releaseYear?: number;
  endYear?: number;
  synopsis?: string;
  genres: string[];
  imdbRating?: number;
  imdbVotes?: number;
  posterUrl?: string;
  imdbUrl: string;
};

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error("IMDb الرسمي غير مهيأ: المتغير " + name + " غير مضبوط.");
  return value;
}

type ImdbSearchResponse = {
  data?: {
    titleSearch?: {
      edges?: Array<{ node?: {
        id?: string;
        titleText?: { text?: string };
        originalTitleText?: { text?: string };
        titleType?: { text?: string };
        releaseYear?: { year?: number; endYear?: number };
        ratingsSummary?: { aggregateRating?: number; voteCount?: number };
        primaryImage?: { url?: string };
        plot?: { plotText?: { plainText?: string } };
        genres?: { genres?: Array<{ text?: string }> };
      } }>;
    };
  };
  errors?: Array<{ message?: string }>;
};

export async function searchImdbTitles(query: string): Promise<ImdbTitle[]> {
  const term = query.trim();
  if (term.length < 2 || term.length > 120) {
    throw new Error("أدخل عبارة بحث بين حرفين و120 حرفًا.");
  }

  const region = process.env.AWS_REGION?.trim() || "us-east-1";
  const client = new DataExchangeClient({ region });
  const graphqlPath = process.env.IMDB_GRAPHQL_PATH?.trim() || "/graphql";
  if (!graphqlPath.startsWith("/") || graphqlPath.startsWith("//")) {
    throw new Error("IMDB_GRAPHQL_PATH يجب أن يكون مسارًا يبدأ بشرطة واحدة.");
  }

  const payload = JSON.stringify({
    query: `query SearchTitles($query: String!) {
      titleSearch(query: $query) {
        edges {
          node {
            id
            titleText { text }
            originalTitleText { text }
            titleType { text }
            releaseYear { year endYear }
            ratingsSummary { aggregateRating voteCount }
            primaryImage { url }
            plot { plotText { plainText } }
            genres { genres { text } }
          }
        }
      }
    }`,
    variables: { query: term }
  });

  // SendApiAsset handles AWS Data Exchange request signing and routing.
  // The caller must have an active licensed IMDb API subscription and valid AWS credentials.
  const result = await client.send(new SendApiAssetCommand({
    DataSetId: required("IMDB_DATASET_ID"),
    RevisionId: required("IMDB_REVISION_ID"),
    AssetId: required("IMDB_ASSET_ID"),
    Method: "POST",
    Path: graphqlPath,
    RequestHeaders: {
      "content-type": ["application/json"],
      "x-api-key": [required("IMDB_API_KEY")]
    },
    Body: new TextEncoder().encode(payload)
  }));

  if (!result.Body) throw new Error("لم يُرجع IMDb بيانات. تحقق من صلاحية مجموعة البيانات وGraphQL path.");
  const bodyText = new TextDecoder().decode(result.Body);
  let body: ImdbSearchResponse;
  try {
    body = JSON.parse(bodyText) as ImdbSearchResponse;
  } catch {
    throw new Error("استجابة IMDb ليست JSON صالحًا. تحقق من مسار API وصلاحية الاشتراك.");
  }
  if (body.errors?.length) {
    throw new Error(body.errors[0]?.message || "تعذّر البحث في IMDb.");
  }

  return (body.data?.titleSearch?.edges ?? []).flatMap(({ node }) => {
    if (!node?.id || !node.titleText?.text) return [];
    const titleType = node.titleType?.text ?? "";
    const type: ImdbTitle["type"] = /tv|series|mini series/i.test(titleType) ? "SERIES" : "MOVIE";
    return [{
      imdbId: node.id,
      title: node.titleText.text,
      originalTitle: node.originalTitleText?.text,
      type,
      releaseYear: node.releaseYear?.year,
      endYear: node.releaseYear?.endYear,
      synopsis: node.plot?.plotText?.plainText ?? "",
      genres: (node.genres?.genres ?? []).flatMap(g => g.text ? [g.text] : []),
      imdbRating: node.ratingsSummary?.aggregateRating,
      imdbVotes: node.ratingsSummary?.voteCount,
      posterUrl: node.primaryImage?.url,
      imdbUrl: "https://www.imdb.com/title/" + node.id + "/"
    }];
  });
}
