import { Filter, GpuProgram, GlProgram } from 'pixi.js';
import vertex from '../defaults/default2.mjs';
import wgslVertex from '../defaults/default.mjs';
import fragment from './grayscale.mjs';
import source from './grayscale2.mjs';

class GrayscaleFilter extends Filter {
  constructor() {
    const gpuProgram = GpuProgram.from({
      vertex: {
        source: wgslVertex,
        entryPoint: "mainVertex"
      },
      fragment: {
        source,
        entryPoint: "mainFragment"
      }
    });
    const glProgram = GlProgram.from({
      vertex,
      fragment,
      name: "grayscale-filter"
    });
    super({
      gpuProgram,
      glProgram,
      resources: {}
    });
  }
}

export { GrayscaleFilter };
//# sourceMappingURL=GrayscaleFilter.mjs.map
