/// <reference types="vite/client" />

import type { ComponentType } from 'react'
import type { PrototypeMeta } from './types'

type PrototypeModule = {
  default: ComponentType
  meta: PrototypeMeta
}

/**
 * Eager on purpose: the sketch component must exist synchronously at render time
 * so every prototype is server-rendered into real HTML, with no Suspense boundary
 * papering over it. The harness is never shipped, so the bundle cost is irrelevant.
 */
const modules = import.meta.glob<PrototypeModule>('./*/index.tsx', { eager: true })

export type Prototype = PrototypeMeta & {
  slug: string
  Sketch: ComponentType
}

export const prototypes: Prototype[] = Object.entries(modules)
  .map(([path, module]) => ({
    slug: path.slice('./'.length, path.lastIndexOf('/')),
    ...module.meta,
    Sketch: module.default,
  }))
  .toSorted((a, b) => a.slug.localeCompare(b.slug))

export function findPrototype(slug: string): Prototype | undefined {
  return prototypes.find((prototype) => prototype.slug === slug)
}
