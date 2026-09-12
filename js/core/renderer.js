// renderer.js - Camada de renderização adaptativa e aceleração do navegador
class RenderManager {
  constructor(canvas, logicalWidth, logicalHeight) {
    this.canvas = canvas;
    this.logicalWidth = logicalWidth;
    this.logicalHeight = logicalHeight;
    this.quality = 'MEDIUM';
    this.mode = 'AUTO';
    this.renderScale = 1;
    this.gpuInfo = this.probeGPU();

    // alpha:false evita composição alpha desnecessária; desynchronized reduz latência
    this.ctx = canvas.getContext('2d', {
      alpha: false,
      desynchronized: true,
      willReadFrequently: false
    });

    canvas.style.aspectRatio = `${logicalWidth} / ${logicalHeight}`;
    canvas.dataset.acceleration = this.gpuInfo.supported ? 'gpu-available' : 'compatibility';
    this.applyQuality('MEDIUM');
  }

  probeGPU() {
    const result = { supported: false, renderer: 'Canvas 2D', vendor: '', webgl2: false };
    try {
      const c = document.createElement('canvas');
      const gl = c.getContext('webgl2', { powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }) ||
                 c.getContext('webgl', { powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false });
      if (!gl) return result;
      result.supported = true;
      result.webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      if (ext) {
        result.renderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || 'GPU disponível';
        result.vendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL) || '';
      } else {
        result.renderer = gl.getParameter(gl.RENDERER) || 'GPU disponível';
        result.vendor = gl.getParameter(gl.VENDOR) || '';
      }
      const lose = gl.getExtension('WEBGL_lose_context');
      if (lose) lose.loseContext();
    } catch (_) {}
    return result;
  }

  setMode(mode='AUTO') {
    this.mode = mode;
    this.canvas.classList.toggle('gpu-preferred', mode === 'PERFORMANCE');
    this.canvas.classList.toggle('compat-render', mode === 'COMPATIBILITY');
  }

  scaleForQuality(quality) {
    let scale = ({ LOW: 0.72, MEDIUM: 0.90, HIGH: 1.0 })[quality] || 0.90;
    // PERFORMANCE prioriza compositor/GPU, mas não aumenta resolução além do necessário.
    if (this.mode === 'PERFORMANCE' && quality === 'HIGH') scale = 1.08;
    if (this.mode === 'COMPATIBILITY') scale = Math.min(scale, 0.90);
    return scale;
  }

  applyQuality(quality='MEDIUM') {
    this.quality = quality;
    const scale = this.scaleForQuality(quality);
    if (Math.abs(scale - this.renderScale) < 0.001 && this.canvas.width) {
      this.configureContext();
      return;
    }
    this.renderScale = scale;
    this.canvas.width = Math.max(320, Math.round(this.logicalWidth * scale));
    this.canvas.height = Math.max(240, Math.round(this.logicalHeight * scale));
    this.configureContext();
  }

  configureContext() {
    const s = this.renderScale;
    // Toda a engine continua trabalhando em 800x600 lógicos.
    this.ctx.setTransform(s, 0, 0, s, 0, 0);
    this.ctx.imageSmoothingEnabled = this.quality !== 'LOW';
    this.ctx.imageSmoothingQuality = this.quality === 'HIGH' ? 'high' : 'medium';
  }

  beginFrame() {
    // Redefine transform caso algum código externo tenha alterado o contexto.
    const s = this.renderScale;
    this.ctx.setTransform(s, 0, 0, s, 0, 0);
  }

  statusLabel() {
    const accel = this.gpuInfo.supported ? 'GPU DISPONÍVEL' : 'COMPATIBILIDADE';
    return `${accel} • ${Math.round(this.renderScale * 100)}%`;
  }

  gpuLabel(max=48) {
    let r = this.gpuInfo.renderer || 'Canvas 2D';
    r = r.replace(/ANGLE \(|\)$/g, '').replace(/Direct3D\d+/gi, 'D3D');
    return r.length > max ? r.slice(0, max-1) + '…' : r;
  }
}
