import AWS from "aws-sdk";
import createError from "http-errors";
import commonMiddleware from "../lib/commonMiddleware";
import { getAuctionById } from "./getAuction";

const dynamoDb = new AWS.DynamoDB.DocumentClient();

async function placeBid(event, context) {
  let updatedAuction;
  const { id } = event.pathParameters;
  const { amount } = event.body;
  const auction = await getAuctionById(id);
  if (amount <= auction.highestBid.amount) {
    throw new createError.Forbidden(
      "Bid amount must be higher than the current highest bid: " +
        auction.highestBid.amount
    );
  }
  const params = {
    TableName: process.env.AUCTIONS_TABLE_NAME,
    Key: { id },
    UpdateExpression: "set highestBid.amount =:amount",
    ExpressionAttributeValues: {
      ":amount": amount,
    },
    ReturnValues: "ALL_NEW",
  };

  try {
    const result = await dynamoDb.update(params).promise();
    updatedAuction = result.Attributes;
  } catch (err) {
    console.error(err);
    throw new createError.InternalServerError(err);
  }

  return {
    statusCode: 200,
    body: JSON.stringify(updatedAuction),
  };
}

export const handler = commonMiddleware(placeBid);
