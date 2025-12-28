import type { FlattenedModel, ModelsApiResponse } from '@/types/models'

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
        inputModalities: model.modalities.input,
        outputModalities: model.modalities.output,

        // Costs (normalized to dollars per 1M tokens)
        inputCost: model.cost.input,
        outputCost: model.cost.output,
        reasoningCost: model.cost.reasoning ?? undefined,
        cacheReadCost: model.cost.cacheRead ?? undefined,
        cacheWriteCost: model.cost.cacheWrite ?? undefined,
        audioInputCost: model.cost.inputAudio ?? undefined,
        audioOutputCost: model.cost.outputAudio ?? undefined,

        // Limits
        contextLimit: model.limit.context,
        inputLimit: model.limit.input ?? undefined,
        outputLimit: model.limit.output,

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
