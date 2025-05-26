// hooks/useAuth.js
import { useState, useEffect, createContext, useContext } from 'react'

const AuthContext = createContext()

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [token, setToken] = useState(localStorage.getItem('token'))
    const [loading, setLoading] = useState(true)

    // Verificar token al cargar
    useEffect(() => {
        if (token) {
            verifyToken()
        } else {
            setLoading(false)
        }
    }, [token])

    const verifyToken = async () => {
        try {
            const response = await fetch('http://flow-backend.test/api/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json'
                }
            })

            if (response.ok) {
                const data = await response.json()
                setUser(data.user)
            } else {
                logout()
            }
        } catch (error) {
            console.error('Error verificando token:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        try {
            const response = await fetch('http://localhost:5000/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            })

            const data = await response.json()

            if (response.ok && data.success) {
                const userToken = data.token
                setToken(userToken)
                setUser(data.user)
                localStorage.setItem('token', userToken)
                return { success: true, user: data.user }
            } else {
                return { success: false, message: data.message }
            }
        } catch (error) {
            console.error('Error en login:', error)
            return { success: false, message: 'Error de conexión' }
        }
    }

    const logout = async () => {
        try {
            if (token) {
                await fetch('http://localhost:5000/logout', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json'
                    }
                })
            }
        } catch (error) {
            console.error('Error en logout:', error)
        } finally {
            setToken(null)
            setUser(null)
            localStorage.removeItem('token')
        }
    }

    const hasRole = (role) => {
        return user?.role === role
    }

    const hasPermission = (permission) => {
        const rolePermissions = {
            admin: ['manage_users', 'manage_roles', 'view_dashboard', 'manage_customers', 'manage_sales', 'manage_services'],
            moderator: ['view_dashboard', 'manage_customers', 'manage_sales', 'manage_services'],
            user: ['view_dashboard']
        }

        return rolePermissions[user?.role]?.includes(permission) || false
    }

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        hasRole,
        hasPermission,
        isAuthenticated: !!user
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}