import type { FlattenedModel, ModelsApiResponse } from '@/types/models'

// Safe access pattern for missing API data
// The API may return models with undefined cost, limit, or modalities objects
// We use optional chaining (?.) and nullish coalescing (??) to provide sensible defaults
export function flattenModelsData(
  response: ModelsApiResponse,
): Array<FlattenedModel> {
  const models: Array<FlattenedModel> = []

  for (const [providerId, provider] of Object.entries(response)) {
    for (const [modelId, model] of Object.entries(provider.models)) {
      models.push({
        // Provider info
        providerId: providerId,
        providerName: provider.name,

        // Model info
        modelId: modelId,
        modelName: model.name,
        modelFamily: model.family,

        // Capabilities (boolean flags)
        selected: false,
        toolCall: model.tool_call,
        reasoning: model.reasoning,
        structuredOutput: model.structured_output,
        temperature: model.temperature,

        // Modalities
        inputModalities: model.modalities?.input ?? [],
        outputModalities: model.modalities?.output ?? [],

        // Costs (normalized to dollars per 1M tokens)
        // Missing data = not displayed (undefined fallback)
        inputCost: model.cost?.input,
        outputCost: model.cost?.output,
        reasoningCost: model.cost?.reasoning,
        cacheReadCost: model.cost?.cache_read,
        cacheWriteCost: model.cost?.cache_write,
        audioInputCost: model.cost?.input_audio,
        audioOutputCost: model.cost?.output_audio,

        // Limits
        contextLimit: model.limit?.context ?? 0,
        inputLimit: model.limit?.input,
        outputLimit: model.limit?.output ?? 0,

        // Access
        weights: model.open_weights ? 'Open' : 'Closed',
        knowledge: model.knowledge ?? undefined,

        // Dates
        releaseDate: model.release_date,
        lastUpdated: model.last_updated,
      })
    }
  }

  return models
}
