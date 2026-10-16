import type { UserRole } from '../types'

export interface RoleTheme {
  accent: string
  accentLight: string
  accentDark: string
  accentGlow: string
  sidebarBg: string
  sidebarBorder: string
  cardBg: string
  activeLinkBg: string
  activeLinkColor: string
  gradient: string
  roleLabel: string
  greeting: string
  badgeBg: string
  badgeColor: string
}

export const roleThemes: Record<UserRole, RoleTheme> = {
  student: {
    accent: '#3b82f6',
    accentLight: '#93c5fd',
    accentDark: '#1d4ed8',
    accentGlow: 'rgba(59,130,246,0.3)',
    sidebarBg: 'rgba(5,11,30,0.92)',
    sidebarBorder: 'rgba(59,130,246,0.08)',
    cardBg: 'rgba(10,20,50,0.7)',
    activeLinkBg: 'rgba(59,130,246,0.12)',
    activeLinkColor: '#93c5fd',
    gradient: 'linear-gradient(135deg,#1d4ed8,#1e3a8a)',
    roleLabel: 'Estudiante',
    greeting: 'Portal estudiantil',
    badgeBg: 'rgba(59,130,246,0.15)',
    badgeColor: '#93c5fd',
  },
  admin: {
    accent: '#f59e0b',
    accentLight: '#fcd34d',
    accentDark: '#d97706',
    accentGlow: 'rgba(245,158,11,0.3)',
    sidebarBg: 'rgba(10,8,20,0.95)',
    sidebarBorder: 'rgba(245,158,11,0.1)',
    cardBg: 'rgba(15,10,30,0.75)',
    activeLinkBg: 'rgba(245,158,11,0.1)',
    activeLinkColor: '#fcd34d',
    gradient: 'linear-gradient(135deg,#d97706,#7c3aed)',
    roleLabel: 'Administrador',
    greeting: 'Centro de control',
    badgeBg: 'rgba(245,158,11,0.12)',
    badgeColor: '#fcd34d',
  },
}

export function getTheme(role: UserRole): RoleTheme {
  return roleThemes[role]
}
