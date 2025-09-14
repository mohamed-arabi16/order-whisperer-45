import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { POSDashboard } from "@/components/pos/POSDashboard";
import { supabase } from "@/integrations/supabase/client";

/**
 * POS System page component that displays the POS system dashboard
 * Only accessible by authenticated restaurant owners and super admins
 */
const POSSystem = (): JSX.Element => {
  const { user, loading, isAdmin, isRestaurantOwner } = useAuth();
  const [tenantSubscription, setTenantSubscription] = useState<string | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if (!user || !isRestaurantOwner) return;

      try {
        // Get user's profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (!profile) return;

        // Get tenant subscription
        const { data: tenant } = await supabase
          .from('tenants')
          .select('subscription_plan')
          .eq('owner_id', profile.id)
          .single();

        setTenantSubscription(tenant?.subscription_plan || 'basic');
      } catch (error) {
        console.error('Error checking subscription:', error);
      } finally {
        setCheckingSubscription(false);
      }
    };

    checkSubscription();
  }, [user, isRestaurantOwner]);

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user || (!isAdmin && !isRestaurantOwner)) {
    return <Navigate to="/auth" replace />;
  }

  // Check if restaurant owner needs premium subscription
  if (isRestaurantOwner && tenantSubscription !== 'premium') {
    return <Navigate to="/pos-access" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <POSDashboard />
    </div>
  );
};

export default POSSystem;