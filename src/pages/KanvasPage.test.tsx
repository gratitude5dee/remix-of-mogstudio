import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import KanvasPage from "@/pages/KanvasPage";
import type { KanvasModel } from "@/features/kanvas/types";

const baseModels: Record<string, KanvasModel[]> = {
  image: [
    {
      id: "fal-ai/nano-banana-pro",
      name: "Nano Banana Pro",
      description: "Image model",
      studio: "image",
      mode: "text-to-image",
      mediaType: "image",
      workflowType: "text-to-image",
      uiGroup: "generation",
      credits: 7,
      requiresAssets: [],
      supportsPrompt: true,
      controls: [],
      defaults: {},
      aliases: [],
    },
    {
      id: "fal-ai/nano-banana-pro/edit",
      name: "Nano Banana Edit",
      description: "Edit model",
      studio: "image",
      mode: "image-to-image",
      mediaType: "image",
      workflowType: "image-edit",
      uiGroup: "advanced",
      credits: 8,
      requiresAssets: ["image"],
      supportsPrompt: true,
      controls: [],
      defaults: {},
      aliases: [],
    },
  ],
  video: [
    {
      id: "fal-ai/sora-2/text-to-video",
      name: "Sora 2",
      description: "Video model",
      studio: "video",
      mode: "text-to-video",
      mediaType: "video",
      workflowType: "text-to-video",
      uiGroup: "generation",
      credits: 35,
      requiresAssets: [],
      supportsPrompt: true,
      controls: [],
      defaults: {},
      aliases: [],
    },
    {
      id: "fal-ai/kling-video/o3/standard/image-to-video",
      name: "Kling I2V",
      description: "Image to video model",
      studio: "video",
      mode: "image-to-video",
      mediaType: "video",
      workflowType: "image-to-video",
      uiGroup: "generation",
      credits: 24,
      requiresAssets: ["image"],
      supportsPrompt: true,
      controls: [],
      defaults: {},
      aliases: [],
    },
  ],
  cinema: [
    {
      id: "fal-ai/nano-banana-pro",
      name: "Nano Banana Cinema",
      description: "Cinema model",
      studio: "cinema",
      mode: "cinematic-image",
      mediaType: "image",
      workflowType: "text-to-image",
      uiGroup: "generation",
      credits: 7,
      requiresAssets: [],
      supportsPrompt: true,
      controls: [],
      defaults: {},
      aliases: [],
    },
  ],
  lipsync: [
    {
      id: "veed/fabric-1.0",
      name: "VEED Fabric 1.0",
      description: "Talking head",
      studio: "lipsync",
      mode: "talking-head",
      mediaType: "video",
      workflowType: "image-to-video",
      uiGroup: "advanced",
      credits: 20,
      requiresAssets: ["image", "audio"],
      supportsPrompt: false,
      controls: [],
      defaults: {},
      aliases: [],
    },
    {
      id: "fal-ai/sync-lipsync/v2",
      name: "Sync Lipsync 2.0",
      description: "Video lip sync",
      studio: "lipsync",
      mode: "lip-sync",
      mediaType: "video",
      workflowType: "video-to-video",
      uiGroup: "advanced",
      credits: 20,
      requiresAssets: ["video", "audio"],
      supportsPrompt: false,
      controls: [],
      defaults: {},
      aliases: [],
    },
  ],
};

vi.mock("@/features/kanvas/service", () => ({
  fetchKanvasModels: vi.fn(async (studio: keyof typeof baseModels) => baseModels[studio] ?? []),
  listKanvasAssets: vi.fn(async () => []),
  listKanvasJobs: vi.fn(async () => []),
  refreshKanvasJobStatus: vi.fn(async () => {
    throw new Error("not used");
  }),
  submitKanvasJob: vi.fn(async () => {
    throw new Error("not used");
  }),
  uploadKanvasAsset: vi.fn(async () => {
    throw new Error("not used");
  }),
}));

function renderPage(initialEntry = "/kanvas") {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route path="/kanvas" element={<KanvasPage />} />
        <Route path="/home" element={<div>Home Destination</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe("KanvasPage", () => {
  it("renders the multi-studio shell and defaults to image", async () => {
    renderPage("/kanvas");

    expect(screen.getByRole("button", { name: /back to home/i })).toBeInTheDocument();
    expect(
      await screen.findByRole("heading", { name: "Image Studio" })
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getAllByText("Nano Banana Pro")[0]).toBeInTheDocument();
    });
  });

  it("respects the studio query param and switches studios from the shell nav", async () => {
    renderPage("/kanvas?studio=video");

    expect(
      await screen.findByRole("heading", { name: "Video Studio" })
    ).toBeInTheDocument();

    const user = userEvent.setup();
    await user.click(screen.getAllByRole("button", { name: /lip sync/i })[0]);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Lip Sync" })).toBeInTheDocument();
    });
  });
});
