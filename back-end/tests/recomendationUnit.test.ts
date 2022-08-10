import {
  recommendationService,
  CreateRecommendationData,
} from "../src/services/recommendationsService.js";
import { recommendationRepository } from "../src/repositories/recommendationRepository.js";
import { jest } from "@jest/globals";
// import { notFoundError } from "../src/utils/errorUtils.js";

jest.mock("../src/services/recommendationsService.ts");

describe("Recomendação - testes unitários", () => {
  it("Deve criar uma nova recomendação", async () => {
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {});
    jest
      .spyOn(recommendationRepository, "create")
      .mockImplementationOnce((): any => {});
    await recommendationService.insert({
      name: "Funk mandela",
      youtubeLink:
        "https://www.youtube.com/watch?v=c6VU4VDWQFM&list=PL_PAubjglqkdTkQy1pkv8COkDpTz-LuwN&index=46",
    });
    expect(recommendationRepository.findByName).toBeCalled();
    expect(recommendationRepository.create).toBeCalled();
  });

  it("Deve não ser possível criar nomes duplicados", async () => {
    const recommendation = {
      name: "Funk mandela",
      youtubeLink:
        "https://www.youtube.com/watch?v=c6VU4VDWQFM&list=PL_PAubjglqkdTkQy1pkv8COkDpTz-LuwN&index=46",
    };
    jest
      .spyOn(recommendationRepository, "findByName")
      .mockImplementationOnce((): any => {
        return {
          name: recommendation.name,
          youtubeLink: recommendation.youtubeLink,
        };
      });
    const response = recommendationService.insert(recommendation);
    expect(response).rejects.toEqual({
      type: "conflict",
      message: "Recommendations names must be unique",
    });
  });
});
