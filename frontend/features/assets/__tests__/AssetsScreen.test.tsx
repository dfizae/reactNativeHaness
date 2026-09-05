import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen } from "@testing-library/react-native";
import * as React from "react";

import { assetsSummaryMock } from "@/api/mocks/assets";
import { getAssetsSummary } from "@/features/assets/api/assets.api";
import { AssetsScreen } from "@/features/assets/components/AssetsScreen";
import { toAssetsSummary } from "@/features/assets/model";

jest.mock("@/features/assets/api/assets.api", () => ({
  USE_MOCKS: true,
  getAssetsSummary: jest.fn(),
}));

const mockedGetSummary = jest.mocked(getAssetsSummary);

function renderAssets() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  return render(
    <QueryClientProvider client={client}>
      <AssetsScreen />
    </QueryClientProvider>
  );
}

describe("AssetsScreen", () => {
  beforeEach(() => {
    mockedGetSummary.mockReset();
  });

  it("총 자산·계좌·정기결제·최근 거래를 표시한다", async () => {
    mockedGetSummary.mockResolvedValue(toAssetsSummary(assetsSummaryMock));
    await renderAssets();
    expect(screen.getByLabelText("불러오는 중")).toBeTruthy();

    expect(await screen.findByText("5,210,000원")).toBeTruthy();
    expect(screen.getByText("408,401원")).toBeTruthy();
    expect(screen.getByText("1,740,480원")).toBeTruthy();
    expect(screen.getAllByRole("button", { name: /송금/ })).toHaveLength(2);
    expect(screen.getByText("넷플릭스 (멤버십)")).toBeTruthy();
    expect(screen.getByText("17,000원")).toBeTruthy();
    expect(screen.getByText("스타벅스 강남점")).toBeTruthy();
    expect(screen.getByText("8월 24일 · 식비")).toBeTruthy();
    expect(screen.getByText("-12,000원")).toBeTruthy();
    expect(screen.getByText("+2,500,000원")).toBeTruthy();
  });

  it("카드 탭으로 전환하면 빈 상태를 보여주고 계좌 목록을 숨긴다", async () => {
    mockedGetSummary.mockResolvedValue(toAssetsSummary(assetsSummaryMock));
    await renderAssets();
    await screen.findByText("5,210,000원");

    await fireEvent.press(screen.getByRole("tab", { name: "카드" }));
    expect(screen.getByText("연결된 카드가 없어요")).toBeTruthy();
    expect(screen.queryByText("입출금 계좌")).toBeNull();
  });

  it("요청이 실패하면 오류 상태와 재시도 버튼을 보여준다", async () => {
    mockedGetSummary.mockRejectedValue(new Error("network"));
    await renderAssets();
    expect(await screen.findByText("정보를 불러오지 못했어요")).toBeTruthy();
    expect(screen.getByRole("button", { name: "다시 시도" })).toBeTruthy();
  });
});
