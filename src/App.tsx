import { useState, useEffect, useRef, useCallback } from 'react'
import QRCode from 'qrcode'
import { saveAs } from 'file-saver'

type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

function App() {
  const [text, setText] = useState('https://tyr1105.github.io/qrgen/')
  const [fgColor, setFgColor] = useState('#000000')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [size, setSize] = useState(400)
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M')
  const [margin, setMargin] = useState(2)
  const [logoFile, setLogoFile] = useState<string | null>(null)
  const [logoSize, setLogoSize] = useState(80)
  const [previewUrl, setPreviewUrl] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateQR = useCallback(async () => {
    if (!text.trim()) { setPreviewUrl(''); return }
    try {
      const canvas = document.createElement('canvas')
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
      })

      // Draw logo if present
      if (logoFile) {
        const ctx = canvas.getContext('2d')!
        const img = new Image()
        img.src = logoFile
        await new Promise<void>((resolve) => {
          img.onload = () => {
            const logoW = logoSize
            const logoH = logoSize
            const x = (canvas.width - logoW) / 2
            const y = (canvas.height - logoH) / 2
            // White background for logo
            const pad = 6
            ctx.fillStyle = bgColor
            ctx.beginPath()
            ctx.roundRect(x - pad, y - pad, logoW + pad * 2, logoH + pad * 2, 8)
            ctx.fill()
            ctx.drawImage(img, x, y, logoW, logoH)
            resolve()
          }
          img.onerror = () => resolve()
        })
      }

      setPreviewUrl(canvas.toDataURL('image/png'))
    } catch (e) {
      console.error(e)
    }
  }, [text, fgColor, bgColor, size, errorLevel, margin, logoFile, logoSize])

  useEffect(() => {
    generateQR()
  }, [generateQR])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setLogoFile(reader.result as string)
    reader.readAsDataURL(file)
  }

  const downloadPNG = () => {
    if (!previewUrl) return
    saveAs(previewUrl, 'qrcode.png')
  }

  const downloadSVG = async () => {
    if (!text.trim()) return
    try {
      const svg = await QRCode.toString(text, {
        type: 'svg',
        margin,
        errorCorrectionLevel: errorLevel,
        width: size,
        color: { dark: fgColor, light: bgColor },
      })
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      saveAs(blob, 'qrcode.svg')
    } catch (e) {
      console.error(e)
    }
  }

  const presets = [
    { name: '经典黑白', fg: '#000000', bg: '#ffffff' },
    { name: '深蓝', fg: '#1e3a5f', bg: '#e8f0fe' },
    { name: '翡翠绿', fg: '#059669', bg: '#ecfdf5' },
    { name: '玫瑰红', fg: '#e11d48', bg: '#fff1f2' },
    { name: '暗夜金', fg: '#92400e', bg: '#1c1917' },
    { name: '星空紫', fg: '#7c3aed', bg: '#f5f3ff' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100">
      <header className="bg-white shadow-sm border-b border-emerald-100">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">📱</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">QR码生成器</h1>
              <p className="text-sm text-gray-500">免费在线二维码制作 · 支持Logo · 高清导出</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：设置 */}
          <div className="space-y-4">
            {/* 输入内容 */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">输入内容</label>
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="输入网址、文字或任何内容..."
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
              />
            </div>

            {/* 颜色预设 */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">颜色方案</label>
              <div className="grid grid-cols-3 gap-2 mb-3">
                {presets.map(p => (
                  <button
                    key={p.name}
                    onClick={() => { setFgColor(p.fg); setBgColor(p.bg) }}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-sm hover:border-emerald-400 cursor-pointer flex items-center gap-2"
                  >
                    <span className="w-4 h-4 rounded-full border" style={{ background: p.fg }}></span>
                    <span className="w-4 h-4 rounded-full border" style={{ background: p.bg }}></span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">前景色</label>
                  <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">背景色</label>
                  <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)}
                    className="w-full h-8 rounded cursor-pointer" />
                </div>
              </div>
            </div>

            {/* 尺寸和容错 */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">尺寸: {size}px</label>
                  <input type="range" min={100} max={1000} step={50} value={size}
                    onChange={e => setSize(Number(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs text-gray-500">边距: {margin}</label>
                  <input type="range" min={0} max={10} value={margin}
                    onChange={e => setMargin(Number(e.target.value))} className="w-full" />
                </div>
              </div>
              <div className="mt-3">
                <label className="text-xs text-gray-500 block mb-1">容错等级</label>
                <div className="flex gap-2">
                  {(['L', 'M', 'Q', 'H'] as ErrorLevel[]).map(level => (
                    <button key={level}
                      onClick={() => setErrorLevel(level)}
                      className={'flex-1 py-1.5 rounded text-sm font-medium cursor-pointer ' +
                        (errorLevel === level ? 'bg-emerald-600 text-white' : 'bg-gray-100 text-gray-600')}
                    >
                      {level} ({({ L: '7%', M: '15%', Q: '25%', H: '30%' })[level]})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Logo上传 */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Logo（可选）</label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 text-sm">
                  上传Logo
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
                {logoFile && (
                  <div className="flex items-center gap-2">
                    <img src={logoFile} alt="logo" className="w-8 h-8 rounded" />
                    <button onClick={() => setLogoFile(null)}
                      className="text-red-500 text-sm cursor-pointer">移除</button>
                  </div>
                )}
              </div>
              {logoFile && (
                <div className="mt-2">
                  <label className="text-xs text-gray-500">Logo大小: {logoSize}px</label>
                  <input type="range" min={30} max={200} value={logoSize}
                    onChange={e => setLogoSize(Number(e.target.value))} className="w-full" />
                </div>
              )}
              <p className="text-xs text-gray-400 mt-2">提示：使用Logo时建议将容错等级设为H（30%）</p>
            </div>
          </div>

          {/* 右侧：预览和下载 */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-semibold text-gray-700 mb-4 text-center">预览</h3>
              <div className="flex justify-center">
                {previewUrl ? (
                  <img src={previewUrl} alt="QR Code" className="max-w-full rounded-lg border" style={{ imageRendering: 'pixelated' }} />
                ) : (
                  <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    输入内容生成二维码
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={downloadPNG} disabled={!previewUrl}
                className="flex-1 py-3 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 cursor-pointer">
                下载 PNG
              </button>
              <button onClick={downloadSVG} disabled={!text.trim()}
                className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 disabled:opacity-50 cursor-pointer">
                下载 SVG
              </button>
            </div>

            {/* 使用说明 */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <h3 className="font-semibold text-gray-700 mb-2">使用说明</h3>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• 输入网址或文字内容，实时生成二维码</li>
                <li>• 选择预设配色或自定义前景/背景颜色</li>
                <li>• 上传Logo放在二维码中央（建议容错等级H）</li>
                <li>• 支持导出PNG和SVG格式</li>
                <li>• 所有处理在浏览器本地完成，不上传任何数据</li>
              </ul>
            </div>
          </div>
        </div>
      </main>

      {/* Tool Network Footer */}
      <footer className="mt-8 border-t border-gray-200 bg-gray-50">
        {/* Google AdSense Placeholder */}
        <div className="max-w-5xl mx-auto px-4 pt-6">
          <div className="bg-gray-100 border border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-400 text-xs">
            {"Google AdSense 广告位"}
          </div>
        </div>

        {/* Tool Network Links */}
        <div className="max-w-5xl mx-auto px-4 py-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center">🛠️ Tool Network</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'AI Tools Box', href: 'https://tyr1105.github.io/ai-tools-box/' },
              { name: 'DevKit Tools', href: 'https://tyr1105.github.io/devkit-tools/' },
              { name: 'PicTool', href: 'https://tyr1105.github.io/pictool/' },
              { name: 'QRGen', href: 'https://tyr1105.github.io/qrgen/' },
              { name: 'RedCover', href: 'https://tyr1105.github.io/redcover/' },
              { name: 'ResumeCraft', href: 'https://tyr1105.github.io/resumecraft/' },
              { name: 'ShotPro', href: 'https://tyr1105.github.io/shotpro/' },
              { name: 'WriteBoom', href: 'https://tyr1105.github.io/writeboom/' },
              { name: 'PDFKit', href: 'https://tyr1105.github.io/pdfkit/' },
            ].map(tool => (
              <a
                key={tool.name}
                href={tool.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 bg-white rounded-full border border-gray-200 text-xs text-gray-600 hover:text-emerald-600 hover:border-emerald-300 transition-colors"
              >
                {tool.name}
              </a>
            ))}
          </div>
        </div>

        {/* 支持作者 */}
        <div className="max-w-5xl mx-auto px-4 pb-6 text-center">
          <p className="text-sm text-gray-500 mb-2">☕ 支持作者</p>
          <p className="text-xs text-gray-400">如果这些工具对你有帮助，欢迎分享给朋友或 Star 支持！</p>
        </div>

        <div className="border-t border-gray-200 py-4 text-center text-xs text-gray-400">
          QR码生成器 · 免费在线二维码制作工具 · 隐私安全
        </div>
      </footer>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}

export default App
