import React, { createContext, useContext, useState, useEffect } from 'react';
import { Vendor, EventConfig, Financials, ValidationResult, Ticket, Zone, Booth } from '../types';
import { MOCK_VENUES } from '../constants';
import { useGlobal } from './GlobalContext';
import { dbService } from '../services/database';

interface EventContextType {
  // Data Inventory
  vendors: Vendor[];
  setVendors: React.Dispatch<React.SetStateAction<Vendor[]>>;
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  zones: Zone[];
  setZones: React.Dispatch<React.SetStateAction<Zone[]>>;
  booths: Booth[];
  setBooths: React.Dispatch<React.SetStateAction<Booth[]>>;
  isDataLoading: boolean;

  // Event Planning State
  eventConfig: EventConfig;
  setEventConfig: (config: EventConfig) => void;
  cart: Vendor[];
  toggleVendor: (vendor: Vendor) => void;
  resetEvent: () => void;
  
  // Computed Logic
  financials: Financials;
  validation: ValidationResult;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { lang, t, user } = useGlobal(); 
  const defaultVenue = MOCK_VENUES[0];

  // --- Data State ---
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [zones, setZones] = useState<Zone[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // --- Event State ---
  const [eventConfig, setEventConfig] = useState<EventConfig>({
    eventName: '', 
    theme: 'Vintage',
    pax: 100,
    dates: [new Date().toISOString().split('T')[0]],
    areaSqm: defaultVenue.areaSqm,
    selectedVenueId: defaultVenue.id,
    taxEntity: 'INDIVIDUAL'
  });
  
  const [cart, setCart] = useState<Vendor[]>([]);

  // --- Computed States ---
  const [financials, setFinancials] = useState<Financials>({ 
    subtotal: 0, platformFee: 0, vat: 0, wht: 0, grandTotal: 0, netPayable: 0
  });

  const [validation, setValidation] = useState<ValidationResult>({ 
    criticalErrors: [], warnings: [],
    staffStatus: { needed: 0, current: 0, status: 'OK' },
    spaceUsage: { totalUsed: 0, percentUsed: 0, status: 'OK' }
  });

  // --- Initialize Data (Async) ---
  useEffect(() => {
    if (!user) return; // Only fetch if logged in

    const fetchData = async () => {
      setIsDataLoading(true);
      try {
        const [v, t, zb] = await Promise.all([
            dbService.getVendors(),
            dbService.getTickets(),
            dbService.getZonesAndBooths()
        ]);
        
        setVendors(v);
        setTickets(t);
        setZones(zb.zones);
        setBooths(zb.booths);
        
        // Load User Config if exists
        const savedConfig = localStorage.getItem(`eventConfig_${user.id}`);
        const savedCart = localStorage.getItem(`eventCart_${user.id}`);
        
        if (savedConfig) {
            try {
                const parsed = JSON.parse(savedConfig);
                if (!parsed.dates) parsed.dates = [new Date().toISOString().split('T')[0]];
                setEventConfig(parsed);
            } catch(e) {}
        }
        if (savedCart) setCart(JSON.parse(savedCart));

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchData();
  }, [user]); // Re-fetch on login

  // --- Persistence (Debounced/Effect) ---
  useEffect(() => {
    if (user && !isDataLoading) {
        localStorage.setItem(`eventConfig_${user.id}`, JSON.stringify(eventConfig));
        localStorage.setItem(`eventCart_${user.id}`, JSON.stringify(cart));
    }
  }, [eventConfig, cart, user, isDataLoading]);

  // --- Update DB when Data Changes (Simulate Server Sync) ---
  useEffect(() => {
      // In a real app, you wouldn't sync whole arrays like this, 
      // but for this MVP architecture we keep local state in sync with our Mock DB service
      // if we were editing items directly.
      // Since vendors/tickets are mostly read-only for the planner view, we skip auto-sync back to DB here
      // Admin functions handle the write-back via dbService methods directly.
  }, [vendors, tickets]);


  // --- Logic: Financial Engine ---
  useEffect(() => {
    const vendorsCost = cart.reduce((sum, item) => sum + item.price, 0);
    const currentVenue = MOCK_VENUES.find(v => v.id === eventConfig.selectedVenueId);
    const venueCost = currentVenue ? currentVenue.price : 0;
    
    const subtotal = vendorsCost + venueCost;
    const platformFee = subtotal * 0.10;
    const vat = (subtotal + platformFee) * 0.07;
    const grandTotal = subtotal + platformFee + vat;
    
    let wht = 0;
    if (eventConfig.taxEntity === 'CORPORATE') {
        wht = (subtotal + platformFee) * 0.03;
    }

    setFinancials({
      subtotal, platformFee, vat, wht, grandTotal, netPayable: grandTotal - wht
    });
  }, [cart, eventConfig.selectedVenueId, eventConfig.taxEntity]);

  // --- Logic: Validation Engine ---
  useEffect(() => {
    const criticalErrors: string[] = [];
    const warnings: string[] = [];

    // 1. Space Validation
    const guestAreaNeeded = eventConfig.pax * 1.0; 
    const vendorAreaNeeded = cart.reduce((sum, item) => sum + (item.specs.area || 0), 0);
    const totalUsed = guestAreaNeeded + vendorAreaNeeded;
    const percentUsed = eventConfig.areaSqm > 0 ? (totalUsed / eventConfig.areaSqm) * 100 : 100;

    let spaceStatus: 'OK' | 'WARNING' | 'OVERCROWDED' = 'OK';
    const currentVenue = MOCK_VENUES.find(v => v.id === eventConfig.selectedVenueId);
    
    if (currentVenue && eventConfig.pax > currentVenue.capacityMax) {
        spaceStatus = 'OVERCROWDED';
        const venueName = lang === 'TH' ? (currentVenue.name_th || currentVenue.name) : currentVenue.name;
        criticalErrors.push(t.capacityExceeded(venueName, currentVenue.capacityMax, eventConfig.pax));
    }

    if (percentUsed > 100) {
      spaceStatus = 'OVERCROWDED';
      criticalErrors.push(t.spaceCritical(Number(totalUsed.toFixed(0)), eventConfig.areaSqm));
    } else if (percentUsed > 85) {
      spaceStatus = 'WARNING';
      warnings.push(t.spaceWarning(Number(percentUsed.toFixed(0))));
    }

    // 2. Staff Validation
    const staffForPax = Math.ceil(eventConfig.pax / 30);
    const staffForArea = Math.ceil(eventConfig.areaSqm / 200);
    const totalStaffNeeded = Math.max(2, staffForPax + staffForArea); 
    const currentStaff = cart.filter(i => i.type === 'STAFF').reduce((sum, item) => sum + (item.specs.members || 0), 0);
    const staffStatus: 'OK' | 'LOW' = currentStaff >= totalStaffNeeded ? 'OK' : 'LOW';
    if (staffStatus === 'LOW') warnings.push(t.staffLowWarning);

    // 3. Tech Validation (Band vs Sound)
    const band = cart.find(i => i.type === 'BAND');
    const sound = cart.find(i => i.type === 'SOUND');

    if (band && sound) {
      const bandName = lang === 'TH' ? (band.name_th || band.name) : band.name;
      const soundName = lang === 'TH' ? (sound.name_th || sound.name) : sound.name;

      if (band.specs.type && sound.specs.support && !sound.specs.support.includes(band.specs.type)) {
        criticalErrors.push(t.mismatch(soundName, band.specs.type));
      }
      if ((sound.specs.watt || 0) < (band.specs.min_watt || 0)) {
        criticalErrors.push(t.powerLow(bandName, band.specs.min_watt || 0, soundName, sound.specs.watt || 0));
      }
    }

    if (sound && sound.specs.watt && sound.specs.watt < eventConfig.pax * 10) {
        warnings.push(t.weakSound(eventConfig.pax));
    }

    // 4. Theme Validation
    if (currentVenue && !currentVenue.tags.includes(eventConfig.theme)) {
        const venueName = lang === 'TH' ? (currentVenue.name_th || currentVenue.name) : currentVenue.name;
        warnings.push(t.themeClashVenue(venueName, eventConfig.theme));
    }
    cart.forEach(item => {
      if (!item.tags.includes(eventConfig.theme)) {
        const itemName = lang === 'TH' ? (item.name_th || item.name) : item.name;
        warnings.push(t.styleClashItem(itemName, eventConfig.theme));
      }
    });

    setValidation({ 
      criticalErrors, warnings,
      staffStatus: { needed: totalStaffNeeded, current: currentStaff, status: staffStatus },
      spaceUsage: { totalUsed, percentUsed, status: spaceStatus }
    });
  }, [cart, eventConfig, lang, vendors, t]);

  // --- Handlers ---
  const toggleVendor = (vendor: Vendor) => {
    const isInCart = cart.find(i => i.id === vendor.id);
    if (isInCart) {
      setCart(cart.filter(i => i.id !== vendor.id));
    } else {
      // Logic: Allow only 1 Band/Sound/Venue type for simplicity
      if (['BAND', 'SOUND', 'VENUE'].includes(vendor.type)) {
        const cleanCart = cart.filter(i => i.type !== vendor.type);
        setCart([...cleanCart, vendor]);
      } else {
        setCart([...cart, vendor]);
      }
    }
  };

  const resetEvent = () => {
    setCart([]);
    setEventConfig({
        eventName: '', theme: 'Vintage', pax: 100,
        dates: [new Date().toISOString().split('T')[0]],
        areaSqm: defaultVenue.areaSqm, selectedVenueId: defaultVenue.id,
        taxEntity: 'INDIVIDUAL'
    });
    if (user) {
        localStorage.removeItem(`eventConfig_${user.id}`);
        localStorage.removeItem(`eventCart_${user.id}`);
    }
  };

  const value = {
    vendors, setVendors, tickets, setTickets, zones, setZones, booths, setBooths, isDataLoading,
    eventConfig, setEventConfig, cart, toggleVendor, resetEvent,
    financials, validation
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) throw new Error('useEvent must be used within an EventProvider');
  return context;
};