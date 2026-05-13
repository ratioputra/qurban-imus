'use client'

import { useState } from 'react'
import { createClient } from "@/utils/supabase/client";
const supabase = createClient();
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, 
  DialogTrigger, DialogDescription 
} from '@/components/ui/dialog'

export function ResetDatabase() {
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const targetPhrase = 'hapus seluruh data'

  const handleReset = async () => {
    if (confirmText !== targetPhrase) return
    
    setLoading(true)
    try {
      // Menghapus data dari tabel-tabel utama
      // Urutan penting jika ada Foreign Key constraint
      const tables = ['produksi', 'distribusi', 'asatidz', 'mudhohi']
      
      for (const table of tables) {
        await supabase.from(table).delete().neq('id', 0) // Menghapus semua baris
      }
      
      alert('Data berhasil direset!')
      window.location.reload()
    } catch (error) {
      alert('Gagal mereset data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="destructive">Reset Database</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apakah Anda yakin?</DialogTitle>
          <DialogDescription>
            Tindakan ini tidak bisa dibatalkan. Ketik <strong>{targetPhrase}</strong> di bawah untuk mengaktifkan tombol hapus.
          </DialogDescription>
        </DialogHeader>
        <Input 
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder={`Ketik: ${targetPhrase}`}
        />
        <Button 
          variant="destructive"
          disabled={confirmText !== targetPhrase || loading}
          onClick={handleReset}
        >
          {loading ? 'Menghapus...' : 'Hapus Seluruh Data'}
        </Button>
      </DialogContent>
    </Dialog>
  )
}