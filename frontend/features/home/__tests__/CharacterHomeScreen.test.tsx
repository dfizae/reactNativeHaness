import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react-native";
import * as React from "react";

import { characterHomeSummaryMock } from "@/api/mocks/character-home";
import { getCharacterHomeSummary } from "@/features/home/api/character-home.api";
import { CharacterHomeScreen } from "@/features/home/components/CharacterHomeScreen";
import { toCharacterHomeSummary } from "@/features/home/model";

jest.mock("@/features/home/api/character-home.api", () => ({
  USE_MOCKS: true,
  getCharacterHomeSummary: jest.fn(),
}));

const mockedGetSummary = jest.mocked(getCharacterHomeSummary);

function renderHome() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <CharacterHomeScreen />
    </QueryClientProvider>
  );
}

describe("CharacterHomeScreen", () => {
  beforeEach(() => {
    mockedGetSummary.mockReset();
  });

  it("불러오는 동안 스켈레톤을 보여주고 완료되면 인사말·코인·예산 카드를 표시한다", async () => {
    mockedGetSummary.mockResolvedValue(toCharacterHomeSummary(characterHomeSummaryMock));
    await renderHome();
    expect(screen.getByLabelText("불러오는 중")).toBeTruthy();

    expect(await screen.findByText("김재영님, 안녕하세요!")).toBeTruthy();
    expect(screen.getByLabelText("보유 코인 1,250개")).toBeTruthy();
    expect(screen.getByRole("button", { name: "상점, 새 소식 3개" })).toBeTruthy();
    expect(screen.getByText("180,000원")).toBeTruthy();
    expect(screen.getByText("좋아요!")).toBeTruthy();
    expect(screen.getByText("총 예산 500,000원 중 320,000원 사용")).toBeTruthy();
    expect(screen.getByRole("progressbar", { name: "예산 사용률 64%" })).toBeTruthy();
    expect(screen.queryByLabelText("불러오는 중")).toBeNull();
  });

  it("요청이 실패하면 오류 상태와 재시도 버튼을 보여준다", async () => {
    mockedGetSummary.mockRejectedValue(new Error("network"));
    await renderHome();
    expect(await screen.findByText("정보를 불러오지 못했어요")).toBeTruthy();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeTruthy();
  });
});
