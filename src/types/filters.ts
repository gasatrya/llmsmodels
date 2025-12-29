export interface FilterState {
  providers: Array<string>
  capabilities: {
    reasoning?: boolean
    toolCall?: boolean
    structuredOutput?: boolean
  }
}

export const defaultFilters: FilterState = {
  providers: [],
  capabilities: {},
}
