import { auth } from '@/lib/auth/config'
import { redirect } from 'next/navigation'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

export default async function AdminPage() {
  const session = await auth()

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage documents, users, and system settings</p>
        </div>
        
        <AdminDashboard />
      </div>
    </div>
  )
}