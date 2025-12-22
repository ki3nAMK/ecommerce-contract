import type { Socket } from 'socket.io-client';

import { useAuthContext } from '@/auth/hooks';
import { useQuery } from '@tanstack/react-query';
import { get, isNil, isUndefined } from 'lodash';
import { getSocketClient, SocketNamespace } from '@/types/socket';
import {
    useState,
    useEffect,
    useContext,
    useCallback,
    createContext,
    useLayoutEffect,
} from 'react';

interface INotifyContext {
    socket: Socket | null;
    disconnectSocket: VoidFunction;
}

export enum UserRole {
    CLIENT = 'CLIENT',
    SELLER = 'SELLER',
    ADMIN = 'ADMIN',
}

const notifyContext = createContext<INotifyContext>({
    socket: null,
    disconnectSocket: () => { },
});

export const NotifyProvider = ({ children }: { children: React.ReactNode }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const { authenticated, user, loading } = useAuthContext();

    const { refetch } = useQuery({
        queryKey: ['socket', user],
        enabled: !loading && authenticated,
        queryFn: async () => {
            try {
                const userRole = get(user, 'role', UserRole.CLIENT)
                const namespace = userRole === UserRole.CLIENT ? SocketNamespace.CLIENT :
                    (userRole === UserRole.SELLER ? SocketNamespace.SELLER : SocketNamespace.CLIENT)

                if (isNil(socket)) {
                    const client = getSocketClient(namespace);

                    if (isNil(client) || isUndefined(client)) {
                        return null;
                    }

                    client?.connect();

                    setSocket(client);

                    return client;
                } 
                    socket?.connect();
                
                return socket;
            } catch (error) {
                console.error('Error connecting to socket:', error);
                setSocket(null);
                return null;
            }
        },
    });

    const disconnectSocket = useCallback(() => {
        if (!isNil(socket) && socket?.connected) {
            socket.removeAllListeners();
            socket.disconnect();
        }
        setSocket(null);
    }, [socket]);

    useLayoutEffect(() => {
        refetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authenticated, loading, user]);

    useEffect(() => 
         () => {
            socket?.removeAllListeners();
            socket?.disconnect();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    , []);

    return (
        <notifyContext.Provider value={{ socket, disconnectSocket }}>
            {children}
        </notifyContext.Provider>
    );
};

export const useNotify = () => {
    const context = useContext(notifyContext);
    if (!context) {
        throw new Error('useNotify must be used within a NotifyProvider');
    }
    return context;
};
