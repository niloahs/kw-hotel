'use client';

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import LoginForm from '../auth/LoginForm';
import RegisterForm from '../auth/RegisterForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { UserType } from '@/lib/auth';

interface AuthModalProps {
    isOpen: boolean;
    onOpenChangeAction: (open: boolean) => void;
    onSuccess?: () => void;
    initialView?: 'login' | 'register';
    reservationId?: number;
}

export default function AuthModal({
                                      isOpen,
                                      onOpenChangeAction,
                                      onSuccess,
                                      initialView = 'login',
                                      reservationId
                                  }: AuthModalProps) {
    const [activeTab, setActiveTab] = useState<string>(initialView);
    const [loginUserType, setLoginUserType] = useState<UserType>('guest');

    // Reset tab when modal is closed
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setActiveTab(initialView);
                setLoginUserType('guest');
            }, 300);
        }
    }, [isOpen, initialView]);

    const handleSuccess = () => {
        onSuccess?.();
        onOpenChangeAction(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChangeAction}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="text-center font-display text-3xl">
                        Welcome to King William Hotel
                    </DialogTitle>
                    <DialogDescription className="text-center">
                        Sign in to manage reservations or create a new account
                    </DialogDescription>
                </DialogHeader>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Sign In</TabsTrigger>
                        <TabsTrigger value="register">Create Account</TabsTrigger>
                    </TabsList>

                    <TabsContent value="login">
                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                User Type
                            </label>
                            <Select
                                value={loginUserType}
                                onValueChange={(value) => setLoginUserType(value as UserType)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select user type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="guest">Guest</SelectItem>
                                    <SelectItem value="staff">Staff</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <LoginForm
                            userType={loginUserType}
                            onSuccess={handleSuccess}
                            onRegisterClick={() => setActiveTab('register')}
                        />
                    </TabsContent>

                    <TabsContent value="register">
                        <RegisterForm
                            onSuccess={handleSuccess}
                            onLoginClick={() => setActiveTab('login')}
                            reservationId={reservationId}
                        />
                    </TabsContent>
                </Tabs>

                <div className="mt-6 text-center">
                    <p className="text-gray-600">
                        You can also continue as a guest when making a reservation
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}