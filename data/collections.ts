export type Collection = {
  collection: {
    id: string
    name: string
    slug: string
    description: string
    image_url: string
    cover_image_url: string
    contract_address: string
    total_supply: number
    verified: boolean
    social_links: string[]
  }
  stats: {
    floor_price_ton: number
    average_sale_price_ton: number
    volume_24h_ton: number
    volume_all_time_ton: number
    num_owners: number
    num_sales_24h: number
  }
  nfts: Array<{
    token_id: string
    name: string
    image_url: string
    owner_address: string
    metadata: {
      description: string
      attributes: Array<{ trait_type: string; value: string }>
    }
    details: {
      minted_timestamp: string
      royalty_percent: number
      listing_status: 'not_listed' | 'listed' | 'sold'
    }
    history: Array<{
      event: 'mint' | 'sale' | 'transfer'
      from: string | null
      to: string | null
      price_ton: number | null
      timestamp: string
    }>
    bids: Array<{
      bidder: string
      price_ton: number
      timestamp: string
    }>
  }>
}

export const collections: Collection[] = [
  {
    collection: {
      id: 'ton-nft-c12345',
      name: 'TON Smart Challenge Winners',
      slug: 'ton-smart-challenge-winners',
      description: 'Collection of winners NFTs from TON Smart Challenge #2',
      image_url: 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=256&q=60',
      cover_image_url: 'https://images.unsplash.com/photo-1516307365426-bea591f0505d?auto=format&fit=crop&w=1400&q=60',
      contract_address: 'EQBq5z4N_GeJyBdvNh4tPjMpSkA08p8vWyiAX6LNbr3aLjI0',
      total_supply: 181,
      verified: true,
      social_links: ['https://t.me/TONSmartChallenge', 'https://twitter.com/tonchallenge']
    },
    stats: {
      floor_price_ton: 2.5,
      average_sale_price_ton: 3.1,
      volume_24h_ton: 10.4,
      volume_all_time_ton: 250.7,
      num_owners: 75,
      num_sales_24h: 5
    },
    nfts: [
      {
        token_id: '95',
        name: 'TON Smart Challenge #2 Winner Trophy #95',
        image_url: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80',
        owner_address: 'EQCxxx…',
        metadata: {
          description: 'Winner NFT for place 1 out of 181',
          attributes: [
            { trait_type: 'Place', value: '1' },
            { trait_type: 'Challenge', value: 'TON Smart Challenge #2' }
          ]
        },
        details: {
          minted_timestamp: '2025-07-15T12:34:56Z',
          royalty_percent: 5,
          listing_status: 'not_listed'
        },
        history: [
          { event: 'mint', from: null, to: 'EQCxxx…', price_ton: null, timestamp: '2025-07-15T12:34:56Z' },
          { event: 'sale', from: 'EQCxxx…', to: 'EQDyyy…', price_ton: 3.0, timestamp: '2025-08-01T09:20:45Z' }
        ],
        bids: [
          { bidder: 'EQZaaa…', price_ton: 3.2, timestamp: '2025-08-02T15:10:11Z' }
        ]
      },
      {
        token_id: '12',
        name: 'TON Smart Challenge #2 Winner Trophy #1214',
        image_url: 'https://images.unsplash.com/photo-1493238792000-8113da705763?auto=format&fit=crop&w=1200&q=80',
        owner_address: 'EQBzzz…',
        metadata: {
          description: 'Winner NFT for place 2 out of 181',
          attributes: [
            { trait_type: 'Place', value: '2' },
            { trait_type: 'Challenge', value: 'TON Smart Challenge #2' }
          ]
        },
        details: {
          minted_timestamp: '2025-07-15T12:40:00Z',
          royalty_percent: 5,
          listing_status: 'not_listed'
        },
        history: [
          { event: 'mint', from: null, to: 'EQBzzz…', price_ton: null, timestamp: '2025-07-15T12:40:00Z' }
        ],
        bids: []
      },
      {
        token_id: '33',
        name: 'TON Smart Challenge #2 Winner Trophy #33',
        image_url: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?q=80&w=764&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        owner_address: 'EQEwww…',
        metadata: {
          description: 'Winner NFT for place 3 out of 181',
          attributes: [
            { trait_type: 'Place', value: '3' },
            { trait_type: 'Challenge', value: 'TON Smart Challenge #2' }
          ]
        },
        details: {
          minted_timestamp: '2025-07-15T12:50:00Z',
          royalty_percent: 5,
          listing_status: 'not_listed'
        },
        history: [],
        bids: []
      }
    ]
  },
  {
    collection: {
      id: 'cyber-art-001',
      name: 'Cyber Neo Art',
      slug: 'cyber-neo-art',
      description: 'A curated set of cyberpunk and synthwave themed art',
      image_url: 'https://images.unsplash.com/photo-1604586376807-3f040f06ab8f?auto=format&fit=crop&w=256&q=60',
      cover_image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=60',
      contract_address: 'EQDne0…',
      total_supply: 128,
      verified: true,
      social_links: ['https://twitter.com/neoart']
    },
    stats: {
      floor_price_ton: 1.1,
      average_sale_price_ton: 1.7,
      volume_24h_ton: 6.2,
      volume_all_time_ton: 120.3,
      num_owners: 54,
      num_sales_24h: 4
    },
    nfts: [
      {
        token_id: 'neo-001',
        name: 'Neon City Guardian',
        image_url: 'https://images.unsplash.com/photo-1704782476133-5863a05a90b1?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        owner_address: 'EQX111…',
        metadata: {
          description: 'Cyberpunk guardian watching over the neon city',
          attributes: [
            { trait_type: 'Theme', value: 'Cyberpunk' },
            { trait_type: 'Mood', value: 'Vigilant' }
          ]
        },
        details: { minted_timestamp: '2025-06-01T10:00:00Z', royalty_percent: 7, listing_status: 'not_listed' },
        history: [],
        bids: []
      },
      {
        token_id: 'neo-007',
        name: 'Synthwave Horizon',
        image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80',
        owner_address: 'EQX222…',
        metadata: {
          description: 'Retro-future horizon with synthwave vibes',
          attributes: [
            { trait_type: 'Theme', value: 'Synthwave' },
            { trait_type: 'Palette', value: 'Neon' }
          ]
        },
        details: { minted_timestamp: '2025-06-03T12:00:00Z', royalty_percent: 6, listing_status: 'not_listed' },
        history: [],
        bids: []
      }
    ]
  },
  {
    collection: {
      id: 'space-wonders-01',
      name: 'Space Wonders',
      slug: 'space-wonders',
      description: 'Exploring the beauty of the universe',
      image_url: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&w=256&q=60',
      cover_image_url: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&w=1400&q=60',
      contract_address: 'EQZspace…',
      total_supply: 256,
      verified: false,
      social_links: ['https://twitter.com/spacewonders']
    },
    stats: {
      floor_price_ton: 0.8,
      average_sale_price_ton: 1.2,
      volume_24h_ton: 3.4,
      volume_all_time_ton: 80.1,
      num_owners: 120,
      num_sales_24h: 2
    },
    nfts: [
      {
        token_id: 'space-42',
        name: 'Galactic Vortex',
        image_url: 'https://images.unsplash.com/photo-1454789548928-9efd52dc4031?auto=format&fit=crop&w=1200&q=80',
        owner_address: 'EQSPACE…',
        metadata: {
          description: 'A swirling vortex in the deep cosmos',
          attributes: [
            { trait_type: 'Type', value: 'Vortex' },
            { trait_type: 'Region', value: 'Deep Space' }
          ]
        },
        details: { minted_timestamp: '2025-05-01T08:00:00Z', royalty_percent: 5, listing_status: 'not_listed' },
        history: [],
        bids: []
      },
      {
        token_id: 'space-88',
        name: 'Aurora Over Ice',
        image_url: 'https://images.unsplash.com/photo-1462332420958-a05d1e002413?auto=format&fit=crop&w=1200&q=80',
        owner_address: 'EQSPACE2…',
        metadata: {
          description: 'Dancing auroras over frozen landscapes',
          attributes: [
            { trait_type: 'Phenomenon', value: 'Aurora' },
            { trait_type: 'Location', value: 'Polar' }
          ]
        },
        details: { minted_timestamp: '2025-05-05T09:30:00Z', royalty_percent: 5, listing_status: 'not_listed' },
        history: [],
        bids: []
      }
    ]
  }
]
