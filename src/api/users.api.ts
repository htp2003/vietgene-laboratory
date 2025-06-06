const mockUsers: User[] = [
    {
        id: '1',
        username: 'doiphandev',
        fullName: 'Doi Phan',
        email: 'doiphandev@gmail.com',
        phone: '0123456789',
        address: 'Ho Chi Minh',
        role: 'admin',
        createdAt: new Date(),
        doctor_id: null
    },
    {
        id: '2',
        username: 'doiphandev2',
        fullName: 'Doi Phan 2',
        email: 'doiphandev2@gmail.com',
        phone: '0123456789',
        address: 'Ho Chi Minh',
        role: 'staff',
        createdAt: new Date(),
        doctor_id: 1
    }

]

// Type
export interface User {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    address?: string;
    role: 'customer' | 'staff' | 'admin';
    createdAt: Date;
    doctor_id: number | null;
}

export const usersApi = {
    // Get all users
    getAll: async (): Promise<User[]> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        return [...mockUsers]
    },

    createUser: async (data: Omit<User, 'id'>): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const newUser = {
            ...data,
            id: Math.random().toString(36).substr(2, 9)
        }
        mockUsers.push(newUser)
        return newUser
    },

    update: async (id: string, data: Partial<User>): Promise<User> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const index = mockUsers.findIndex(u => u.id === id)
        if (index === -1) throw new Error('User not found')
        const updatedUser = {
            ...mockUsers[index],
            ...data
        }
        mockUsers[index] = updatedUser
        return updatedUser
    },

    delete: async (id: string): Promise<void> => {
        await new Promise(resolve => setTimeout(resolve, 500))
        const index = mockUsers.findIndex(u => u.id === id)
        if (index === -1) throw new Error('User not found')
        mockUsers.splice(index, 1)
    }
}