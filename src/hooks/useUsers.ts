import React, { useCallback, useEffect, useState } from 'react'
import { User, usersApi } from '../api/users.api'

export  function useUsers() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)

    // Fetch all users
    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true)
        const data = await usersApi.getAll()
        setUsers(data)
    } catch (error) {
        setError(error as Error)
    } finally {
        setLoading(false)
    }
}, [])

// Load users on mount
useEffect(() => {
    fetchUsers()
}, [fetchUsers])


// Create new user
const createUsers = useCallback(async (data: Omit<User, 'id'>) => {
    try {
        setLoading(true)
        const newUser = await usersApi.createUser(data)
        setUsers(prev => [...prev, newUser])
        return newUser
    } catch (error) {
        setError(error as Error)
        throw error
    } finally {
        setLoading(false)
    }
}, [])

// Update user
const updateUser = useCallback(async (id: string, data: Partial<User>) => {
    try {
        setLoading(true)
        const updatedUser = await usersApi.update(id, data)
        setUsers(prev => prev.map(user => user.id === id ? updatedUser : user))
        return updatedUser
    } catch (error) {
        setError(error as Error)
        throw error
    } finally {
        setLoading(false)
    }
}, [])

// Delete user
const deleteUser = useCallback(async (id: string) => {
    try {
        setLoading(true)
        await usersApi.delete(id)
        setUsers(prev => prev.filter(user => user.id !== id))
    } catch (error) {
        setError(error as Error)
        throw error
    } finally {
        setLoading(false)
    }
}, [])

// Search users
const searchUsers = useCallback((searchTerm: string) => {
    return users.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
    )
}, [users])

return {
    users,
    loading,
    error,
    fetchUsers,
    createUsers,
    updateUser,
    deleteUser,
    searchUsers
}
}
