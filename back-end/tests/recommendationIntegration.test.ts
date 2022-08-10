import app from "../src/app.js";
import supertest from "supertest";
import { prisma } from "../src/database.js";

const appForTest = supertest(app);
beforeEach(async () => {
  await prisma.$executeRaw`TRUNCATE TABLE recommendations;`;
});

describe("Post - /recommendations", () => {
  it("Deve Responder com 201 caso a recomendação seja valida e criar no banco", async () => {
    const body = {
      name: "lane8-majestic",
      youtubeLink: "https://www.youtube.com/watch?v=ekexQdTwkak",
    };
    const response = await appForTest.post("/recommendations").send(body);
    const verifyOnDb = await prisma.recommendation.findFirst({
      where: {
        name: body.name,
      },
    });
    expect(response.status).toBe(201);
    expect(verifyOnDb).not.toBeNull();
  });
  it("Deve retornar status 422 quando a requisição é invalida ou nula", async () => {
    const body = {
      named: "lane8-majestic",
      link: "https://www.youtube.com/watch?v=ekexQdTwkak",
    };
    const response1 = await appForTest.post("/recommendations").send(body);
    const response2 = await appForTest.post("/recommendations").send({});
    expect(response1.status).toBe(422);
    expect(response2.status).toBe(422);
  });
});

describe("Post - /recommendations/:id/upvote", () => {
  it("Deve responder com status 200 se fornecido um id valido e somado ao score de pesquisa", async () => {
    const recommendation = {
      name: "lane8-majestic",
      youtubeLink: "https://www.youtube.com/watch?v=ekexQdTwkak",
      score: 27,
    };
    const onDb = await prisma.recommendation.create({
      data: recommendation,
    });

    const response = await appForTest
      .post(`/recommendations/${onDb.id}/upvote`)
      .send({});
    expect(response.status).toBe(200);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { id: onDb.id },
    });
    expect(recommendationCreated.score).toBe(recommendation.score + 1);
  });
  it("Deve responder com status 404 se for invalido ou não existir", async () => {
    const response = await appForTest
      .post(`/recommendations/5/upvote`)
      .send({});
    expect(response.status).toBe(404);
  });
});

describe("Post - /recommendations/:id/downvote", () => {
  it("Deve responder com status 200 se o Id fot válido", async () => {
    const recommendation = {
      name: "lane8-majestic",
      youtubeLink: "https://www.youtube.com/watch?v=ekexQdTwkak",
      score: 27,
    };
    const onDb = await prisma.recommendation.create({
      data: recommendation,
    });
    const response = await appForTest
      .post(`/recommendations/${onDb.id}/downvote`)
      .send({});
    expect(response.status).toBe(200);

    const recommendationCreated = await prisma.recommendation.findFirst({
      where: { id: onDb.id },
    });
    expect(recommendationCreated.score).toBe(recommendation.score - 1);
  });
  it("Deve retornar 404 se o Id for inválido ", async () => {
    const response = await appForTest
      .post(`/recommendations/5/downvote`)
      .send({});
    expect(response.status).toBe(404);
  });
  it("Deve apagar recomendações com pontuação menores que -5", async () => {
    const recommendation = {
      name: "lane8-majestic",
      youtubeLink: "https://www.youtube.com/watch?v=ekexQdTwkak",
    };
    const onDb = await prisma.recommendation.create({
      data: recommendation,
    });
    for (let i = 0; i <= 5; i++) {
      await appForTest.post(`/recommendations/${onDb.id}/downvote`).send({});
    }
    const recommendationCreated = await prisma.recommendation.findUnique({
      where: { id: onDb.id },
    });
    expect(recommendationCreated).toBeNull();
  });
});

describe("Get - /recommendations", () => {
  it("Deve retornar status 200 e retornar um array de recomendações", async () => {
    const recommendation = {
      name: "lane8-majestic2",
      youtubeLink: "https://www.youtube.com/watch?v=ekexQdTwkak",
      score: 27,
    };
    const recommendation2 = {
      name: "lane8-majestic1",
      youtubeLink: "https://www.youtube.com/watch?v=ekexQdTwkak",
      score: 27,
    };
    await prisma.recommendation.create({
      data: recommendation,
    });
    await prisma.recommendation.create({
      data: recommendation2,
    });

    // for (let i = 0; i < 12; i++) {
    //   const onDb = await prisma.recommendation.create({
    //     data: recommendation,
    //   });
    // }
    const response = await appForTest.get("/recommendations");
    expect(response.status).toBe(200);
    expect(response.body).not.toBeNull();
    expect(response.body.length).toEqual(2);
  });
});
