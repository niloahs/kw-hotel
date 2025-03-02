'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import axios from 'axios';
import { Room, RoomType } from '@/types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';

export default function RoomList() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');

    const [rooms, setRooms] = useState<Room[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedRoomType, setSelectedRoomType] = useState<string>('all');

    useEffect(() => {
        if (!checkIn || !checkOut || !guests) {
            router.push('/reservations');
            return;
        }

        const fetchAvailableRooms = async () => {
            try {
                // Fetch room types
                const roomTypesResponse = await axios.get<RoomType[]>('/api/rooms/types');
                setRoomTypes(roomTypesResponse.data);

                // Fetch available rooms
                const response = await axios.get<Room[]>(
                    `/api/rooms/available?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`
                );
                setRooms(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Failed to load available rooms');
                } else {
                    setError('Failed to load available rooms. Please try again.');
                }
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAvailableRooms();
    }, [checkIn, checkOut, guests, router]);

    const filteredRooms = selectedRoomType === 'all'
        ? rooms
        : rooms.filter(room => room.roomTypeId.toString() === selectedRoomType);

    const selectRoom = (roomId: number) => {
        router.push(`/reservations/details?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}&roomId=${roomId}`);
    };

    if (loading) {
        return <RoomListSkeleton />;
    }

    if (error) {
        return (
            <Alert variant="destructive" className="mb-8">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                    {error}
                    <div className="mt-4">
                        <Button
                            onClick={() => router.push('/reservations')}
                            variant="outline"
                        >
                            Return to Booking
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    if (rooms.length === 0) {
        return (
            <Alert className="mb-8">
                <AlertTitle>No Rooms Available</AlertTitle>
                <AlertDescription>
                    We&#39;re sorry, but there are no rooms available for your selected dates.
                    <div className="mt-4">
                        <Button
                            onClick={() => router.push('/reservations')}
                            variant="outline"
                        >
                            Change Dates
                        </Button>
                    </div>
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <div>
            <div className="bg-stone-50 p-4 rounded-lg mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="font-display text-xl">Available Rooms</h2>
                        <p className="text-gray-600">
                            {checkIn} to {checkOut} · {guests} {parseInt(guests || '0') === 1 ? 'guest' : 'guests'}
                        </p>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Select
                            value={selectedRoomType}
                            onValueChange={setSelectedRoomType}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="All Room Types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Room Types</SelectItem>
                                {roomTypes.map((type) => (
                                    <SelectItem key={type.roomTypeId} value={type.roomTypeId.toString()}>
                                        {type.typeName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRooms.map((room) => (
                    <RoomCard
                        key={room.roomId}
                        room={room}
                        onSelect={() => selectRoom(room.roomId)}
                    />
                ))}
            </div>
        </div>
    );
}

interface RoomCardProps {
    room: Room;
    onSelect: () => void;
}

function RoomCard({ room, onSelect }: RoomCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative h-48">
                <Image
                    src={`/images/rooms/${room.typeName?.toLowerCase().replace(' ', '-') || 'default'}.jpg`}
                    alt={room.typeName || 'Hotel Room'}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            <CardHeader>
                <CardTitle>{room.typeName}</CardTitle>
                <CardDescription>
                    Room {room.roomNumber}, Floor {room.floorNumber}
                </CardDescription>
            </CardHeader>

            <CardContent>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-lg font-semibold">
                            {formatCurrency(room.adjustedRate || room.baseRate || 0)}
                            <span className="text-sm font-normal"> / night</span>
                        </p>

                        {room.adjustedRate && room.adjustedRate !== room.baseRate && (
                            <div className="flex items-center space-x-2">
                                <span className="text-sm line-through text-gray-500">
                                    {formatCurrency(room.baseRate || 0)}
                                </span>
                                <Badge variant="secondary" className="bg-green-100 text-green-800">
                                    Special Rate
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>

            <CardFooter>
                <Button
                    onClick={onSelect}
                    className="w-full"
                >
                    Select Room
                </Button>
            </CardFooter>
        </Card>
    );
}

function RoomListSkeleton() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-10 w-48" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <Card key={i} className="overflow-hidden">
                        <Skeleton className="h-48 w-full" />
                        <CardHeader>
                            <Skeleton className="h-6 w-24 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-5 w-32 mb-2" />
                            <Skeleton className="h-4 w-full" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-10 w-full" />
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}