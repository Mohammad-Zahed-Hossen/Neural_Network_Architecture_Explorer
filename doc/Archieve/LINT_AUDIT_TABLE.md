# Lint Stabilization Audit Table

## Phase 1: Audit Table

| File | Issue | Root Cause | Risk | Fix Strategy |
|------|-------|------------|------|--------------|
| app/concepts/receptive-field/page.tsx | `react-hooks/set-state-in-effect` error | `setIsLoading(true)` called synchronously in useEffect | High - React hook correctness | Remove setIsLoading call, use derived state pattern |
| app/concepts/receptive-field/page.tsx | `react/no-unescaped-entities` error | Apostrophe in "layer's" on line 218 | Low - JSX correctness | Use `'` or `&#39;` |
| app/concepts/receptive-field/page.tsx | Unused imports: Sliders, Play, Link, LayerRFInfo | Imported but never used | Low - Safe auto-fix | Remove unused imports |
| app/concepts/receptive-field/page.tsx | Unused state: showDetailedInfo/setShowDetailedInfo | State declared but never used | Low - Safe auto-fix | Remove unused state |
| app/concepts/receptive-field/page.tsx | Unused eslint-disable directive | Line 73 disables rule that doesn't trigger | Low - Safe auto-fix | Remove the directive |
| app/learn/page.tsx | Unused import: GraduationCap | Imported but never used | Low - Safe auto-fix | Remove unused import |
| app/catalog/page.tsx | Unused import: motion | Imported but never used | Low - Safe auto-fix | Remove unused import |
| app/architecture-patterns/page.tsx | Unused imports: motion, AnimatePresence, HelpCircle | Imported but never used | Low - Safe auto-fix | Remove unused imports |
| app/concepts/training-dynamics/page.tsx | Unused imports: motion, AnimatePresence, AlertOctagon, ArrowLeft | Imported but never used | Low - Safe auto-fix | Remove unused imports |
| app/evolution/page.tsx | Unused import: HelpCircle | Imported but never used | Low - Safe auto-fix | Remove unused import |
| app/not-found.tsx | Unused import: ArrowRight | Imported but never used | Low - Safe auto-fix | Remove unused import |
| app/page.tsx | Unused import: GraduationCap | Imported but never used | Low - Safe auto-fix | Remove unused import |
| app/papers/page.tsx | Unused import: HelpCircle | Imported but never used | Low - Safe auto-fix | Remove unused import |
| app/research-map/page.tsx | Unused imports: BookOpen, Tag | Imported but never used | Low - Safe auto-fix | Remove unused imports |
| components/layout/navbar.tsx | Unused variable: GroupIcon | Assigned but never used | Low - Safe auto-fix | Remove unused variable |
| components/learn/model-advisor.tsx | Unused imports: Award, Zap | Imported but never used | Low - Safe auto-fix | Remove unused imports |
| components/learn/model-advisor.tsx | Unused variable: paramsInM | Assigned but never used | Low - Safe auto-fix | Remove unused variable |
| components/learn/model-advisor.tsx | `react-hooks/exhaustive-deps` warning | questions.length in dependency array | Low - Hook correctness | Remove questions.length from deps |
| components/model-catalog/model-card.tsx | Unused import: Badge | Imported but never used | Low - Safe auto-fix | Remove unused import |
| components/model-comparison/comparison-chart.tsx | Unused variable: idx | Defined but never used in map callback | Low - Safe auto-fix | Remove unused variable |
| components/model-comparison/comparison-table.tsx | Unused variable: tags | Defined but never used in map callback | Low - Safe auto-fix | Remove unused variable |
| components/model-comparison/comparison-table.tsx | Unused variables: maxParams, maxFLOPs, maxMemory, maxDepth, maxTop1, maxTop5 | Computed but never used | Low - Safe auto-fix | Remove unused variables |
| components/model-explorer/custom-node.tsx | Unused imports: ComponentType, Layers, Image, Activity, Zap, Shrink, AlignJustify, Key, PlusCircle, GitMerge, Eye | Imported but never used | Low - Safe auto-fix | Remove unused imports |
| components/model-explorer/inspector-panel.tsx | Unused imports: Image, Zap, Shrink, AlignJustify, Key, PlusCircle, GitMerge, BarChart3, Eye | Imported but never used | Low - Safe auto-fix | Remove unused imports |
| components/model-explorer/layer-list.tsx | Unused imports: Layers, Image, Activity, Zap, Shrink, AlignJustify, Key, PlusCircle, GitMerge, Eye | Imported but never used | Low - Safe auto-fix | Remove unused imports |
| components/model-explorer/layer-list.tsx | Unused type: LayerType | Imported but never used | Low - Safe auto-fix | Remove unused type |
| components/model-explorer/layer-list.tsx | Unused variable: groupIdx | Defined but never used in map callback | Low - Safe auto-fix | Remove unused variable |
| scripts/validate-links.ts | CommonJS style in ESM project | Uses require-style imports | Low - Project scripts | Convert to ESM or add config |
| scripts/validate-model-data.ts | CommonJS style in ESM project | Uses require-style imports | Low - Project scripts | Convert to ESM or add config |

## Summary
- **Total Issues**: 71 (2 errors, 69 warnings)
- **Category A (Safe auto-fix)**: ~50 issues (unused imports/variables)
- **Category B (Type safety)**: 0 issues
- **Category C (React correctness)**: 2 issues (set-state-in-effect, exhaustive-deps)
- **Category D (JSX correctness)**: 1 issue (unescaped entities)
- **Category E (Project scripts)**: 2 issues (CommonJS in scripts)