import { describe, it, expect } from "vitest";
import { truncateAddress } from "@/lib/starknet";
import { cn } from "@/lib/utils";
import { reducer } from "@/hooks/use-toast";

describe("truncateAddress", () => {
  it("should truncate a long address", () => {
    const address = "0x1234567890abcdef1234567890abcdef12345678";
    expect(truncateAddress(address)).toBe("0x1234...5678");
  });

  it("should return empty string for empty input", () => {
    expect(truncateAddress("")).toBe("");
  });

  it("should handle undefined", () => {
    expect(truncateAddress(undefined as any)).toBe("");
  });

  it("should handle null", () => {
    expect(truncateAddress(null as any)).toBe("");
  });

  it("should handle very short addresses", () => {
    expect(truncateAddress("0x123")).toBe("0x123");
  });
});

describe("cn utility", () => {
  it("should merge class names", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2");
  });

  it("should handle conflicting tailwind classes", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("should filter out falsy values", () => {
    expect(cn("px-2", false && "hidden", null, undefined, "py-2")).toBe("px-2 py-2");
  });

  it("should handle conditional classes", () => {
    expect(cn("base", true ? "active" : "inactive")).toBe("base active");
  });
});

describe("toast reducer", () => {
  it("should add a toast", () => {
    const state = { toasts: [] };
    const newState = reducer(state, {
      type: "ADD_TOAST",
      toast: { id: "1", title: "Test", open: true },
    });
    expect(newState.toasts).toHaveLength(1);
    expect(newState.toasts[0].id).toBe("1");
    expect(newState.toasts[0].title).toBe("Test");
  });

  it("should update a toast", () => {
    const state = { toasts: [{ id: "1", title: "Old", open: true }] };
    const newState = reducer(state, {
      type: "UPDATE_TOAST",
      toast: { id: "1", title: "New" },
    });
    expect(newState.toasts[0].title).toBe("New");
  });

  it("should dismiss a toast", () => {
    const state = { toasts: [{ id: "1", open: true }] };
    const newState = reducer(state, { type: "DISMISS_TOAST", toastId: "1" });
    expect(newState.toasts[0].open).toBe(false);
  });

  it("should remove a toast", () => {
    const state = { toasts: [{ id: "1", open: true }] };
    const newState = reducer(state, { type: "REMOVE_TOAST", toastId: "1" });
    expect(newState.toasts).toHaveLength(0);
  });

  it("should not exceed toast limit", () => {
    const state = { toasts: [] };
    const state1 = reducer(state, { 
      type: "ADD_TOAST", 
      toast: { id: "1", open: true } 
    });
    const state2 = reducer(state1, { 
      type: "ADD_TOAST", 
      toast: { id: "2", open: true } 
    });
    expect(state2.toasts).toHaveLength(1);
    expect(state2.toasts[0].id).toBe("2"); // Latest toast
  });

  it("should dismiss all toasts when no ID provided", () => {
    const state = { 
      toasts: [
        { id: "1", open: true },
        { id: "2", open: true }
      ] 
    };
    const newState = reducer(state, { type: "DISMISS_TOAST" });
    expect(newState.toasts[0].open).toBe(false);
    expect(newState.toasts[1].open).toBe(false);
  });
});