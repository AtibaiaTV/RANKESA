'use client'

import { useRef, useState } from 'react'
import { Camera, X } from 'lucide-react'

interface AvatarUploadProps {
  name: string
  value: string          // base64 ou URL
  onChange: (base64: string) => void
}

export function AvatarUpload({ name, value, onChange }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function processFile(file: File) {
    if (!file.type.startsWith('image/')) return
    // Redimensiona para máximo 400px e converte para base64
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new window.Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const MAX = 400
        const ratio = Math.min(MAX / img.width, MAX / img.height, 1)
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        onChange(canvas.toDataURL('image/jpeg', 0.82))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Círculo de preview */}
      <div
        className={`relative w-24 h-24 rounded-full border-2 cursor-pointer transition-all ${
          dragging
            ? 'border-brand scale-105'
            : value
              ? 'border-brand/30'
              : 'border-dashed border-gray-300 hover:border-brand'
        } overflow-hidden bg-gray-50 flex items-center justify-center`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragging(false)
          const file = e.dataTransfer.files[0]
          if (file) processFile(file)
        }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={value} alt="Foto" className="w-full h-full object-cover" />
            {/* Overlay de trocar */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
              <Camera size={20} className="text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-1 text-gray-400">
            <Camera size={22} />
            <span className="text-[9px] font-medium uppercase tracking-wide">Foto</span>
          </div>
        )}
      </div>

      {/* Inicial gerada automaticamente abaixo se não tiver foto */}
      {value ? (
        <button
          type="button"
          onClick={() => onChange('')}
          className="flex items-center gap-1 text-[10px] text-red-400 hover:text-red-600 transition-colors"
        >
          <X size={11} /> Remover foto
        </button>
      ) : (
        <p className="text-[10px] text-gray-400 text-center">
          Clique ou arraste uma imagem
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        name={name}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) processFile(file)
        }}
      />
    </div>
  )
}
