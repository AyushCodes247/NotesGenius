import { tavily } from "@tavily/core";
import { AppError } from "@utils/general.util.js";
import env from "@configs/env.config.js";
import logger from "@utils/logger.util.js";

const client = tavily({
  apiKey: env.TAVILY_KEY,
});

interface SearchResult {
  title: string;
  url: string;
  content: string;
  favicon: string | undefined;
}

interface WebContextResult {
  context: string;
  sources: {
    title: string;
    url: string;
    favicon: string | undefined;
  }[];
}

const searchWeb = async (query: string): Promise<WebContextResult> => {
  try {
    const response = await client.search(query, {
      searchDepth: "advanced",
      maxResults: 4,
    });

    const results: SearchResult[] = response.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
      favicon: result.favicon,
    }));

    const context = results
      .map(
        (result, index) => `[Source ${index + 1}]
Title: ${result.title}
URL: ${result.url}
Content:
${result.content}`,
      )
      .join("\n\n--\n\n");

    return {
      context,
      sources: results.map((result) => ({
        title: result.title,
        url: result.url,
        favicon: result.favicon,
      })),
    };
  } catch (error) {
    logger.error(
      {
        err: error instanceof Error ? error : new Error(String(error)),
      },
      "Tavily search error.",
    );

    throw new AppError(
      "Failed to retrieve web context.",
      502,
      error instanceof Error ? error : undefined,
    );
  }
};

export default searchWeb;
