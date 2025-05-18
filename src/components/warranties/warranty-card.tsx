"use client";

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { Warranty } from '@/types';
import { CalendarClock, ShoppingBag, FileText, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format, differenceInDays, parseISO, isValid } from 'date-fns';

interface WarrantyCardProps {
  warranty: Warranty;
  onDelete?: (id: string) => void;
}

export function WarrantyCard({ warranty, onDelete }: WarrantyCardProps) {
  const purchaseDate = isValid(parseISO(warranty.purchaseDate)) ? format(parseISO(warranty.purchaseDate), 'MMM dd, yyyy') : 'N/A';
  const warrantyEndDate = warranty.warrantyEndDate && isValid(parseISO(warranty.warrantyEndDate)) ? format(parseISO(warranty.warrantyEndDate), 'MMM dd, yyyy') : 'N/A';
  
  let daysRemaining: number | null = null;
  let expiryStatus: 'active' | 'expiring-soon' | 'expired' | 'unknown' = 'unknown';

  if (warranty.warrantyEndDate && isValid(parseISO(warranty.warrantyEndDate))) {
    const endDate = parseISO(warranty.warrantyEndDate);
    daysRemaining = differenceInDays(endDate, new Date());
    if (daysRemaining < 0) {
      expiryStatus = 'expired';
    } else if (daysRemaining <= 30) {
      expiryStatus = 'expiring-soon';
    } else {
      expiryStatus = 'active';
    }
  }

  const getExpiryBadgeVariant = () => {
    switch (expiryStatus) {
      case 'expired': return 'destructive';
      case 'expiring-soon': return 'secondary'; // Yellowish/Orange if theme supports, otherwise secondary
      case 'active': return 'default'; // Or a green variant like accent if appropriate
      default: return 'outline';
    }
  };
  
  const getExpiryBadgeText = () => {
    if (expiryStatus === 'expired') return 'Expired';
    if (expiryStatus === 'expiring-soon' && daysRemaining !== null) return `Expires in ${daysRemaining}d`;
    if (expiryStatus === 'active' && daysRemaining !== null) return `Expires in ${daysRemaining}d`;
    return 'Ends ' + warrantyEndDate;
  };


  return (
    <Card className="flex flex-col justify-between shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-semibold mb-1">{warranty.productName}</CardTitle>
          {expiryStatus !== 'unknown' && (
             <Badge variant={getExpiryBadgeVariant()} className="ml-2 shrink-0">
               {expiryStatus === 'expiring-soon' && <AlertTriangle className="h-3 w-3 mr-1" />}
               {getExpiryBadgeText()}
             </Badge>
          )}
        </div>
        {warranty.category && <CardDescription className="text-sm text-muted-foreground">{warranty.category}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex items-center">
          <ShoppingBag className="h-4 w-4 mr-2 text-primary" />
          <span>Purchased: {purchaseDate}</span>
        </div>
        <div className="flex items-center">
          <CalendarClock className="h-4 w-4 mr-2 text-primary" />
          <span>Warranty Ends: {warrantyEndDate}</span>
        </div>
        {warranty.retailer && (
          <p className="text-xs text-muted-foreground">Retailer: {warranty.retailer}</p>
        )}
        {warranty.notes && (
          <p className="text-xs text-muted-foreground truncate">Notes: {warranty.notes}</p>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center pt-4 border-t">
        <div className="space-x-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/warranties/${warranty._id}`}>
              <Edit3 className="h-4 w-4 mr-1 md:mr-2" />
              <span className="hidden md:inline">View/Edit</span>
              <span className="md:hidden">Edit</span>
            </Link>
          </Button>
          {warranty.documentUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={warranty.documentUrl} target="_blank" rel="noopener noreferrer">
                <FileText className="h-4 w-4 mr-1 md:mr-2" />
                 <span className="hidden md:inline">Document</span>
                 <span className="md:hidden">Doc</span>
              </a>
            </Button>
          )}
        </div>
        {onDelete && (
          <Button variant="destructive" size="icon" onClick={() => onDelete(warranty._id)} className="h-8 w-8">
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
