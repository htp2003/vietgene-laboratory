export interface User {
    id: number;
    username: string;
    email: string;
    fullName: string;
    phone?: string;
    address?: string;
    role: 'customer' | 'staff' | 'admin';
    createdAt: Date;
}

export interface Service {
    id: number;
    serviceName: string;
    serviceType: 'civil' | 'administrative';
    testCategory: 'paternity' | 'maternity' | 'sibling' | 'ancestry';
    description?: string;
    price: number;
    durationDays: number;
    collectionMethods: string[];
    isActive: boolean;
    createdAt: Date;
}