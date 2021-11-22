import AWS from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

export async function getAuctionById(id) {
  let auction;

  try {
    const result = await dynamoDb
      .get({
        TableName: process.env.AUCTIONS_TABLE_NAME,
        Key: { id },
      })
      .promise();
    auction = result.Item;
  } catch (e) {
    console.error(e);
    throw new createError.InternalServerError(e);
  }

  if (!auction) {
    throw new createError.NotFound("Auction not found");
  }
  return auction;
}

async function getAuction(event, context) {
  const { id } = event.pathParameters;
  const auction = await getAuctionById(id);

  return {
    statusCode: 200,
    body: JSON.stringify(auction),
  };
}

export const handler = commonMiddleware(getAuction);
