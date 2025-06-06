import { mockUsers, User } from './users.api'   

const mockDocters: Doctor[] = [
    {
        id: 1,
        doctor_code: "BS001",
        licensce_number: "ABC123",
        is_active: true,
        created_at: new Date(),
      }
]

// Type
export interface Doctor {
    id: number;
    doctor_code: string;
    licensce_number: string;
    is_active: boolean;
    created_at: Date;
    fullName?: string;
    email?: string;
    phone?: string;
}

export const doctorsApi = {
    // Get all docters
    getAll: async (): Promise<Doctor[]> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return mockDocters.map(doctor => {
            const user = mockUsers.find(u => u.doctor_id === doctor.id)
            return {
                ...doctor,
                fullName: user?.fullName,
                email: user?.email,
                phone: user?.phone
            }
        })
    },
    createDoctor: async (data: Omit<Doctor, 'id' |'created_at'> & {user_id: string}): Promise<Doctor> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const newDoctor = {
            ...data,
            id: Math.floor(Math.random() * 1000000),
            created_at: new Date(),
        }
        mockDocters.push(newDoctor)

        if (data.user_id) {
            const user = mockUsers.find(u => u.id === data.user_id)
            if (user) {
                user.doctor_id = newDoctor.id
            }
        }
        return newDoctor
    },
    updateDoctor: async (id: number, data: Partial<Doctor>): Promise<Doctor> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const index = mockDocters.findIndex(d => d.id === id)
        if (index === -1) throw new Error('Doctor not found')
        const updatedDoctor = {
            ...mockDocters[index],
            ...data
        }
        mockDocters[index] = updatedDoctor
        return updatedDoctor
    },
    deleteDoctor: async (id: number): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const index = mockDocters.findIndex(doc => doc.id === id)
        if (index === -1) throw new Error('Doctor not found')
        mockDocters.splice(index, 1)

        mockUsers.forEach(user => {
            if (user.doctor_id === id) user.doctor_id = null
        })
    }
}
