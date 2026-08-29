import { cn } from "@/lib/utils";

describe("cn", () => {
  it("병합 시 뒤의 Tailwind 클래스가 앞의 충돌 클래스를 덮어쓴다", () => {
    expect(cn("bg-card p-4", "bg-background")).toBe("p-4 bg-background");
  });

  it("falsy 값을 무시한다", () => {
    expect(cn("text-foreground", false, undefined, null, "")).toBe("text-foreground");
  });
});
