import type { IOrderProductItem } from 'src/types/order';

import { Button, Chip } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardHeader from '@mui/material/CardHeader';
import Stack from '@mui/material/Stack';

import { useAuthContext } from '@/auth/hooks';
import orderService, { IUpdateItemStatusPayload } from '@/lib/service/order.service';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { fCurrency, fEth } from 'src/utils/format-number';
import EscrowABI from "@/abis/Escrow.json";
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BrowserProvider, Contract, ethers } from 'ethers';
import config from "@/config/blockchain.json";
import { get } from 'lodash';

// ----------------------------------------------------------------------
// ENUM TRẠNG THÁI
export enum OrderType {
  NONE = 'NONE',
  DEPOSIT_ESCROW = 'DEPOSIT_ESCROW',
  FULLY_DEPOSITED = 'FULLY_DEPOSITED',
  CANCLED = 'CANCLED',
  ON_WAITING_REFUND = 'ON_WAITING_REFUND',
  SELLER_FINALIZED = 'SELLER_FINALIZED',
  ORDER_RECEIVED = 'ORDER_RECEIVED',
  DONE = 'DONE',
}

// ITEM MỞ RỘNG
export type IOrderProductItemExtended = IOrderProductItem & {
  orderType?: OrderType;
  escrowAmount?: number;
  remainingAmount?: number;
  status?: OrderType;
  escrow?: number;
};

// ----------------------------------------------------------------------

type Props = {
  taxes?: number;
  shipping?: number;
  discount?: number;
  subtotal?: number;
  totalAmount?: number;
  items?: IOrderProductItemExtended[];
  orderId: string
};

// ----------------------------------------------------------------------

export function OrderDetailsItems({
  taxes,
  shipping,
  discount,
  subtotal,
  items = [],
  totalAmount,
  orderId
}: Props) {
  const queryClient = useQueryClient();
  const [escrowContract, setEscrowContract] = useState<ethers.Contract | null>(null);

  const loadBlockchainData = async () => {
    const provider = new BrowserProvider((window as any).ethereum);

    const network = await provider.getNetwork();

    const chainId = String(network.chainId) as keyof typeof config;

    const escrow = new Contract(
      config[chainId].escrow.address,
      EscrowABI,
      provider
    );

    setEscrowContract(escrow);

    // (window as any).ethereum.on("accountsChanged", async (accounts: string[]) => {
    //   const account = accounts[0];
    //   setAccount(account as any);
    // });
  };

  useEffect(() => {
    loadBlockchainData();
  }, []);

  const updateStatusMutation = useMutation({
    mutationFn: (payload: { data: IUpdateItemStatusPayload }) =>
      orderService.updateItemStatus(orderId, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order-detail'] });
    },
  });

  const handleUpdateStatus = (productId: string, status: OrderType) => {
    updateStatusMutation.mutate({
      data: {
        productId,
        status,
      },
    });
  };


  const { user } = useAuthContext();

  const isSeller = useMemo(() => user?.role === 'SELLER', [user]);
  const isBuyer = useMemo(() => user?.role === 'CLIENT', [user]);

  // ----------------------------------------------------------------------
  // TOTAL
  const renderTotal = (
    <Stack spacing={2} alignItems="flex-end" sx={{ p: 3, textAlign: 'right', typography: 'body2' }}>
      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Subtotal</Box>
        <Box sx={{ width: 160, typography: 'subtitle2' }}>{fCurrency(subtotal) || '-'}</Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Shipping</Box>
        <Box sx={{ width: 160, ...(shipping && { color: 'error.main' }) }}>
          {shipping ? `- ${fCurrency(shipping)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Discount</Box>
        <Box sx={{ width: 160, ...(discount && { color: 'error.main' }) }}>
          {discount ? `- ${fCurrency(discount)}` : '-'}
        </Box>
      </Stack>

      <Stack direction="row">
        <Box sx={{ color: 'text.secondary' }}>Taxes</Box>
        <Box sx={{ width: 160 }}>{taxes ? fCurrency(taxes) : '-'}</Box>
      </Stack>

      <Stack direction="row" sx={{ typography: 'subtitle1' }}>
        <div>Total</div>
        <Box sx={{ width: 160 }}>{fCurrency(totalAmount) || '-'}</Box>
      </Stack>
    </Stack>
  );

  const toBytes32 = (hexId: string) => {
    return "0x" + hexId.padStart(64, "0");
  };


  const callContract = useCallback(async (method: string, args: any[] = [], value?: string | bigint) => {
    if (!escrowContract) return console.error("Contract not loaded");

    const provider = new BrowserProvider((window as any).ethereum);
    const signer = await provider.getSigner();

    const contractWithSigner = escrowContract.connect(signer);

    if (value) {
      return (contractWithSigner as any)[method](...args, { value });
    }

    return (contractWithSigner as any)[method](...args);
  }, [escrowContract])

  const handleDepositEscrow = async (item: IOrderProductItemExtended) => {
    const escrowAmount = (item.productId as any)?.escrow || 0;

    const productIdBytes32 = toBytes32(get(item, "productId.id", ""));
    const orderIdBytes32 = toBytes32(get(item, "orderContractId", ""));

    await callContract(
      "depositEarnest",
      [productIdBytes32, orderIdBytes32, item.quantity],
      ethers.parseEther(String(escrowAmount))
    );

    handleUpdateStatus(item.productId.id, OrderType.DEPOSIT_ESCROW);
  }


  // ----------------------------------------------------------------------
  // CHIP TRẠNG THÁI
  const getStatusChip = (type: OrderType) => {
    const map: Record<OrderType, { label: string; color: any }> = {
      NONE: { label: 'Wating for deposit escrow', color: 'info' },
      DEPOSIT_ESCROW: { label: 'Escrowed, wait for remaining deposit', color: 'warning' },
      FULLY_DEPOSITED: { label: 'Fully Deposited', color: 'info' },
      CANCLED: { label: 'Cancelled', color: 'error' },
      ON_WAITING_REFUND: { label: 'Refund Requested', color: 'secondary' },
      SELLER_FINALIZED: { label: 'Seller Finalized', color: 'primary' },
      ORDER_RECEIVED: { label: 'Received', color: 'success' },
      DONE: { label: 'Completed', color: 'success' },
    };

    const { label, color } = map[type] || map.NONE;
    return <Chip label={label} color={color} size="small" />;
  };

  // ----------------------------------------------------------------------
  // BUTTON ACTION
  const renderActions = (item: IOrderProductItemExtended) => {
    const status = item.status ?? OrderType.NONE;
    const loading = updateStatusMutation.isPending;

    // BUYER ACTIONS
    if (isBuyer) {
      switch (status) {
        case OrderType.NONE:
          return (
            <Button
              size="small"
              variant="contained"
              color="primary"
              startIcon={<Iconify icon="solar:wallet-bold" />}
              disabled={loading}
              onClick={() => { handleDepositEscrow(item) }}
            >
              Deposit Escrow
            </Button>
          );

        case OrderType.DEPOSIT_ESCROW:
          return (
            <Button
              size="small"
              variant="contained"
              color="secondary"
              startIcon={<Iconify icon="solar:money-bag-bold" />}
              disabled={loading}
              onClick={() => handleUpdateStatus(item.productId.id, OrderType.FULLY_DEPOSITED)}
            >
              Deposit Remaining {fEth(item.remainingAmount || 0)}
            </Button>
          );

        case OrderType.SELLER_FINALIZED:
          return (
            <Button
              size="small"
              variant="contained"
              color="success"
              startIcon={<Iconify icon="solar:box-bold" />}
              disabled={loading}
              onClick={() => handleUpdateStatus(item.productId.id, OrderType.ORDER_RECEIVED)}
            >
              Confirm Received
            </Button>
          );

        case OrderType.FULLY_DEPOSITED:
          return (
            <Chip label="Waiting for seller finalize" color="warning" size="small" />
          );

        case OrderType.ON_WAITING_REFUND:
          return (
            <Chip label="Refund in progress" color="secondary" size="small" />
          );

        default:
          return null;
      }
    }

    // SELLER ACTIONS
    if (isSeller) {
      switch (status) {
        case OrderType.FULLY_DEPOSITED:
          return (
            <Button
              size="small"
              variant="contained"
              color="info"
              startIcon={<Iconify icon="solar:check-circle-bold" />}
              disabled={loading}
              onClick={() => handleUpdateStatus(item.productId.id, OrderType.SELLER_FINALIZED)}
            >
              Finalize Order
            </Button>
          );

        case OrderType.SELLER_FINALIZED:
          return <Chip label="You finalized" color="primary" size="small" />;

        case OrderType.ORDER_RECEIVED:
          return <Chip label="Buyer received" color="success" size="small" />;

        default:
          return null;
      }
    }

    return null;
  };


  // ----------------------------------------------------------------------

  return (
    <Card>
      <CardHeader title="Order Details" />

      <Scrollbar>
        {items.map((item, index) => {
          const safeProduct = item.productId || {
            id: `mock-${index}`,
            name: 'Unknown product',
            price: 0,
            sku: 'N/A',
            coverUrl: '',
          };

          return (
            <Stack
              key={safeProduct.id}
              sx={{
                p: 3,
                borderBottom: index < items.length - 1 ? '1px dashed' : 'none',
                borderColor: 'divider',
              }}
            >
              {/* Dòng 1 */}
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar
                  src={safeProduct.coverUrl}
                  variant="rounded"
                  sx={{ width: 64, height: 64, flexShrink: 0 }}
                />

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Stack direction="row" alignItems="center" sx={{ mb: 0.5 }}>
                    <Box
                      sx={{
                        fontWeight: 600,
                        fontSize: 15,
                        color: 'text.primary',
                        pr: 1,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {safeProduct.name}
                    </Box>

                    {getStatusChip(item.status || OrderType.NONE)}
                  </Stack>

                  <Box sx={{ color: 'text.disabled', fontSize: 13 }}>
                    SKU: {safeProduct.sku}
                  </Box>
                </Box>

                {/* ACTION BUTTON */}
                <Box sx={{ ml: 'auto', pl: 2 }}>{renderActions(item)}</Box>
              </Stack>

              {/* Dòng 2 */}
              <Stack direction="row" spacing={6} sx={{ mt: 2, color: 'text.secondary', fontSize: 14 }}>
                <Box>
                  <Box component="span" sx={{ color: 'text.disabled', mr: 1 }}>
                    Quantity
                  </Box>
                  <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    x{item.quantity}
                  </Box>
                </Box>

                <Box>
                  <Box component="span" sx={{ color: 'text.disabled', mr: 1 }}>
                    Price
                  </Box>
                  <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>
                    {fEth(safeProduct.price)}
                  </Box>
                </Box>
              </Stack>
            </Stack>
          );
        })}
      </Scrollbar>

      {renderTotal}
    </Card>
  );
}
