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
        toolCall: model.toolCall,
        reasoning: model.reasoning,
        structuredOutput: model.structuredOutput,
        temperature: model.temperature,

        // Modalities
        inputModalities: model.modalities?.input ?? [],
        outputModalities: model.modalities?.output ?? [],

        // Costs (normalized to dollars per 1M tokens)
        // Missing data = not displayed (undefined fallback)
        inputCost: model.cost?.input,
        outputCost: model.cost?.output,
        reasoningCost: model.cost?.reasoning,
        cacheReadCost: model.cost?.cacheRead,
        cacheWriteCost: model.cost?.cacheWrite,
        audioInputCost: model.cost?.inputAudio,
        audioOutputCost: model.cost?.outputAudio,

        // Limits
        contextLimit: model.limit?.context ?? 0,
        inputLimit: model.limit?.input,
        outputLimit: model.limit?.output ?? 0,

        // Access
        weights: model.openWeights ? 'Open' : 'Closed',
        knowledge: model.knowledge ?? undefined,

        // Dates
        releaseDate: model.releaseDate,
        lastUpdated: model.lastUpdated,
      })
    }
  }

  return models
}
