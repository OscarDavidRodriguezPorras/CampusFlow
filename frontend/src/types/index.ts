export type UserRole = 'student' | 'admin'

export interface User {
  id: number
  full_name: string
  email: string
  role: UserRole
  is_active: boolean
  created_at: string
}

export interface Space {
  id: number
  name: string
  space_type: 'classroom' | 'cubicle' | 'lab' | 'meeting_room'
  location: string
  capacity: number
  description: string | null
  amenities: string | null
  is_active: boolean
  created_at: string
}

export type ReservationStatus = 'pending' | 'approved' | 'rejected' | 'cancelled' | 'finished'

export interface Reservation {
  id: number
  user_id: number
  space_id: number
  title: string
  purpose: string | null
  attendees_count: number
  start_time: string
  end_time: string
  status: ReservationStatus
  rejection_reason: string | null
  created_at: string
  updated_at: string
}

export type EquipmentStatus = 'available' | 'loaned' | 'maintenance' | 'retired'
export type EquipmentCategory = 'laptop' | 'tablet' | 'projector' | 'camera' | 'cable' | 'other'

export interface Equipment {
  id: number
  inventory_code: string
  name: string
  category: EquipmentCategory
  description: string | null
  status: EquipmentStatus
  is_active: boolean
  created_at: string
}

export type LoanStatus = 'pending' | 'approved' | 'delivered' | 'returned' | 'rejected' | 'overdue'

export interface Loan {
  id: number
  user_id: number
  equipment_id: number
  purpose: string | null
  status: LoanStatus
  requested_return_date: string
  delivered_at: string | null
  returned_at: string | null
  return_notes: string | null
  created_at: string
  updated_at: string
}

export type IncidentCategory = 'hardware' | 'software' | 'network' | 'infrastructure' | 'safety' | 'other'
export type IncidentPriority = 'low' | 'medium' | 'high' | 'critical'
export type IncidentStatus = 'open' | 'assigned' | 'in_progress' | 'resolved' | 'closed'

export interface Incident {
  id: number
  reporter_id: number
  assigned_to_id: number | null
  title: string
  description: string
  category: IncidentCategory
  priority: IncidentPriority
  status: IncidentStatus
  location: string | null
  ai_suggested_category: string | null
  ai_suggested_priority: string | null
  created_at: string
  updated_at: string
}
