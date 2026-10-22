import {DataExchangeClient,SendApiAssetCommand} from "@aws-sdk/client-dataexchange";
import {SignatureV4} from "@aws-sdk/signature-v4";
import {Sha256} from "@aws-crypto/sha256-js";
import {HttpRequest} from "@aws-sdk/protocol-http";
import {defaultProvider} from "@aws-sdk/credential-provider-node";
export type ImdbTitle={imdbId:string;title:string;originalTitle?:string;type:"MOVIE"|"SERIES"|"ANIME";releaseYear?:number;endYear?:number;synopsis?:string;genres:string[];imdbRating?:number;imdbVotes?:number;posterUrl?:string;imdbUrl:string};
function required(n:string){const v=process.env[n];if(!v)throw new Error("IMDb integration is not configured: missing "+n+".");return v;}
export async function searchImdbTitles(query:string):Promise<ImdbTitle[]>{
 if(query.trim().length<2)throw new Error("أدخل حرفين على الأقل للبحث.");
 const endpoint=new URL(required("IMDB_GRAPHQL_URL")),region=process.env.AWS_REGION||"us-east-1";
 const client=new DataExchangeClient({region,credentials:defaultProvider()});
 const asset=await client.send(new SendApiAssetCommand({DataSetId:required("IMDB_DATASET_ID"),RevisionId:required("IMDB_REVISION_ID"),AssetId:required("IMDB_ASSET_ID")}));
 if(!asset.DataSetId)throw new Error("IMDb Data Exchange asset unavailable.");
 const payload=JSON.stringify({query:`query SearchTitles($query: String!) { titleSearch(query: $query) { edges { node { id titleText { text } originalTitleText { text } titleType { text } releaseYear { year endYear } ratingsSummary { aggregateRating voteCount } primaryImage { url } plot { plotText { plainText } } genres { genres { text } } } } } }`,variables:{query:query.trim()}});
 const signer=new SignatureV4({credentials:defaultProvider(),region,service:"execute-api",sha256:Sha256});
 const request=new HttpRequest({protocol:endpoint.protocol,hostname:endpoint.hostname,port:endpoint.port?Number(endpoint.port):undefined,method:"POST",path:endpoint.pathname+endpoint.search,headers:{host:endpoint.host,"content-type":"application/json"},body:payload});
 const signed=await signer.sign(request);
 const response=await fetch(endpoint,{method:"POST",headers:signed.headers as HeadersInit,body:payload,cache:"no-store"});
 if(!response.ok)throw new Error("IMDb API request failed ("+response.status+"). تحقق من endpoint والصلاحيات.");
 const body=await response.json() as {data?:{titleSearch?:{edges?:Array<{node:any}>}};errors?:Array<{message:string}>};
 if(body.errors?.length)throw new Error(body.errors[0].message);
 return (body.data?.titleSearch?.edges??[]).map(({node})=>({imdbId:String(node.id??""),title:node.titleText?.text??"Untitled",originalTitle:node.originalTitleText?.text,type:/tv|series|mini series/i.test(node.titleType?.text??"")?"SERIES":"MOVIE",releaseYear:node.releaseYear?.year,endYear:node.releaseYear?.endYear,synopsis:node.plot?.plotText?.plainText??"",genres:(node.genres?.genres??[]).map((g:any)=>g.text).filter(Boolean),imdbRating:node.ratingsSummary?.aggregateRating??undefined,imdbVotes:node.ratingsSummary?.voteCount??undefined,posterUrl:node.primaryImage?.url,imdbUrl:"https://www.imdb.com/title/"+node.id+"/"})).filter(row=>row.imdbId&&row.title);
}
