const URL = "http://localhost:3000";

beforeEach(() => {
  cy.resetBeforeTest();
});

describe("Criando uma recomendação", () => {
  const recommendation = {
    name: "lane8 -majestic ",
    youtubeLink: "https://www.youtube.com/watch?v=eU0GlH8aYkE",
  };

  it("Deve criar uma recomendação", () => {
    cy.visit(`${URL}/`);
    cy.get('[placeholder*="Name"]').type(recommendation.name);
    cy.get('[placeholder*="https://youtu.be/..."]').type(
      recommendation.youtubeLink
    );
    cy.intercept("POST", "/recommendations").as("recommendation");
    cy.get("#createButtom").click();
    cy.wait("@recommendation");
    cy.contains(`${recommendation.name}`).should("exist");
  });
});
