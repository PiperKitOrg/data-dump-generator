export const DATA_GENERATOR_DEFAULTS = {
  bigintBase: 100000,
  floatMax: 1000,
  decimalMax: 10000,
  decimalPlacesFloat: 2,
  decimalPlacesDecimal: 4,
  baseYear: 2024,
  baseMonthIndex: 0,
  dayCycle: 27,
  maxHour: 23,
  nullableFieldNullRate: 0.15,
  nullableFkNullRate: 0.25,
  enumFallbackValue: "v_1",
} as const;
