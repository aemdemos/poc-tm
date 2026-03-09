#!/usr/bin/env node
/**
 * Shim: delegates to the portable skill at .claude/skills/excat-readiness-tracker/
 * This file exists for backward compatibility. The canonical generator lives in the skill directory.
 */
import('./../../.claude/skills/excat-readiness-tracker/generate-tracker.js');
