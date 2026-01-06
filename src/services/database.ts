import { Vendor, Ticket, Zone, Booth, Venue } from '../types';
import { MOCK_VENDORS, MOCK_TICKETS, MOCK_ZONES, MOCK_BOOTHS, MOCK_VENUES } from '../constants';

// Simulate Network Latency (300-800ms)
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

class MockDatabase {
  
  // --- Initialization ---
  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem('db_vendors')) {
      localStorage.setItem('db_vendors', JSON.stringify(MOCK_VENDORS));
    }
    if (!localStorage.getItem('db_tickets')) {
      localStorage.setItem('db_tickets', JSON.stringify(MOCK_TICKETS));
    }
    if (!localStorage.getItem('db_zones')) {
      localStorage.setItem('db_zones', JSON.stringify(MOCK_ZONES));
    }
    if (!localStorage.getItem('db_booths')) {
      localStorage.setItem('db_booths', JSON.stringify(MOCK_BOOTHS));
    }
  }

  private getData<T>(key: string): T {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  }

  private setData(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  // --- Vendors ---
  async getVendors(): Promise<Vendor[]> {
    await delay();
    return this.getData<Vendor[]>('db_vendors');
  }

  async addVendor(vendor: Vendor): Promise<Vendor> {
    await delay();
    const vendors = this.getData<Vendor[]>('db_vendors');
    const newVendor = { ...vendor, id: Date.now() }; // Simulate Auto-increment ID
    vendors.push(newVendor);
    this.setData('db_vendors', vendors);
    return newVendor;
  }

  async updateVendor(vendor: Vendor): Promise<Vendor> {
    await delay();
    const vendors = this.getData<Vendor[]>('db_vendors');
    const index = vendors.findIndex(v => v.id === vendor.id);
    if (index !== -1) {
      vendors[index] = vendor;
      this.setData('db_vendors', vendors);
      return vendor;
    }
    throw new Error('Vendor not found');
  }

  async deleteVendor(id: number): Promise<void> {
    await delay();
    let vendors = this.getData<Vendor[]>('db_vendors');
    vendors = vendors.filter(v => v.id !== id);
    this.setData('db_vendors', vendors);
  }

  // --- Tickets (Marketplace) ---
  async getTickets(): Promise<Ticket[]> {
    await delay();
    return this.getData<Ticket[]>('db_tickets');
  }

  async addTicket(ticket: Ticket): Promise<Ticket> {
    await delay();
    const tickets = this.getData<Ticket[]>('db_tickets');
    const newTicket = { ...ticket, id: `t-${Date.now()}` };
    tickets.unshift(newTicket);
    this.setData('db_tickets', tickets);
    return newTicket;
  }

  async buyTicket(ticketId: string): Promise<void> {
    await delay();
    const tickets = this.getData<Ticket[]>('db_tickets');
    const ticket = tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.status = 'SOLD';
      this.setData('db_tickets', tickets);
    }
  }

  // --- Zones & Booths ---
  async getZonesAndBooths(): Promise<{ zones: Zone[], booths: Booth[] }> {
    await delay();
    return {
      zones: this.getData<Zone[]>('db_zones'),
      booths: this.getData<Booth[]>('db_booths')
    };
  }

  async updateBooth(booth: Booth): Promise<Booth> {
    await delay();
    const booths = this.getData<Booth[]>('db_booths');
    const index = booths.findIndex(b => b.id === booth.id);
    if (index !== -1) {
      booths[index] = booth;
      this.setData('db_booths', booths);
      return booth;
    }
    throw new Error('Booth not found');
  }

  // --- Venues (Static for now, but async interface) ---
  async getVenues(): Promise<Venue[]> {
    await delay(200);
    return MOCK_VENUES;
  }
}

export const dbService = new MockDatabase();