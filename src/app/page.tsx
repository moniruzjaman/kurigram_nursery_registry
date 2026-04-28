'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import {
  Search, Phone, MapPin, TreePine, Leaf, Flower2, Pill, 
  Filter, ChevronDown, ChevronUp, ExternalLink, Users,
  BarChart3, Map, List, PhoneCall, Layers, Hash, Navigation,
  AlertTriangle, CheckCircle2, XCircle, ClipboardList
} from 'lucide-react'

interface InventoryItem {
  category: string
  plant_name: string | null
  age_group: string | null
  total: number
  seedlings: number
  grafts: number
}

interface Nursery {
  registry_serial: number | null
  owner: string
  nursery_name_raw: string
  address: string | null
  mobile: string | null
  mobile_source?: string
  upazila: string
  latitude: number | null
  longitude: number | null
  gps_status: string | null
  maps_link: string | null
  fruit_seedlings: number
  forest_seedlings: number
  medicinal_seedlings: number
  total_seedlings: number
  main_variety: string | null
  verification: string | null
  priority: string | null
  has_pivot_data: boolean
  pivot_inventory: InventoryItem[]
  pivot_total_plants: number
  pivot_total_seedlings: number
  pivot_total_grafts: number
  region: string
  district: string
}

export default function Home() {
  const [nurseries, setNurseries] = useState<Nursery[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUpazila, setSelectedUpazila] = useState<string>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [hasMobileFilter, setHasMobileFilter] = useState<string>('all')
  const [hasGpsFilter, setHasGpsFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('serial')
  const [expandedNursery, setExpandedNursery] = useState<number | null>(null)
  const [selectedNursery, setSelectedNursery] = useState<Nursery | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')

  useEffect(() => {
    fetch('/api')
      .then(res => res.json())
      .then(data => {
        setNurseries(data)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const upazilas = useMemo(() => {
    const ups = [...new Set(nurseries.map(n => n.upazila))].sort()
    return ups
  }, [nurseries])

  const categories = ['Fruit', 'Forest', 'Medicinal']

  const filteredNurseries = useMemo(() => {
    let result = nurseries.filter(n => {
      const matchesSearch = !searchQuery || 
        n.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.address && n.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (n.mobile && n.mobile.includes(searchQuery)) ||
        n.upazila.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (n.nursery_name_raw && n.nursery_name_raw.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesUpazila = selectedUpazila === 'all' || n.upazila === selectedUpazila
      const matchesMobile = hasMobileFilter === 'all' || 
        (hasMobileFilter === 'yes' && n.mobile) ||
        (hasMobileFilter === 'no' && !n.mobile)
      const matchesGps = hasGpsFilter === 'all' || 
        (hasGpsFilter === 'yes' && n.latitude && n.latitude !== 0) ||
        (hasGpsFilter === 'no' && (!n.latitude || n.latitude === 0))

      const matchesCategory = selectedCategory === 'all' || 
        n.pivot_inventory.some(i => {
          if (selectedCategory === 'Fruit') return i.category === 'Fruit'
          if (selectedCategory === 'Forest') return i.category === 'Forest'
          if (selectedCategory === 'Medicinal') return i.category === 'Medicinal'
          return false
        })

      return matchesSearch && matchesUpazila && matchesMobile && matchesGps && matchesCategory
    })

    result.sort((a, b) => {
      if (sortBy === 'serial') return (a.registry_serial || 9999) - (b.registry_serial || 9999)
      if (sortBy === 'name') return a.owner.localeCompare(b.owner)
      if (sortBy === 'plants-desc') return b.pivot_total_plants - a.pivot_total_plants
      if (sortBy === 'plants-asc') return a.pivot_total_plants - b.pivot_total_plants
      if (sortBy === 'upazila') return a.upazila.localeCompare(b.upazila)
      return 0
    })

    return result
  }, [nurseries, searchQuery, selectedUpazila, selectedCategory, hasMobileFilter, hasGpsFilter, sortBy])

  const stats = useMemo(() => ({
    total: nurseries.length,
    withMobile: nurseries.filter(n => n.mobile).length,
    withGps: nurseries.filter(n => n.latitude && n.latitude !== 0).length,
    withInventory: nurseries.filter(n => n.has_pivot_data && n.pivot_inventory.length > 0).length,
    totalPlants: nurseries.reduce((sum, n) => sum + n.pivot_total_plants, 0),
    totalSeedlings: nurseries.reduce((sum, n) => sum + n.pivot_total_seedlings, 0),
    totalGrafts: nurseries.reduce((sum, n) => sum + n.pivot_total_grafts, 0),
    totalRegistrySeedlings: nurseries.reduce((sum, n) => sum + (n.total_seedlings || 0), 0),
    noMobile: nurseries.filter(n => !n.mobile).length,
    noGps: nurseries.filter(n => !n.latitude || n.latitude === 0).length,
  }), [nurseries])

  const upazilaStats = useMemo(() => {
    const map: Record<string, { count: number; plants: number; withMobile: number; withGps: number }> = {}
    nurseries.forEach(n => {
      if (!map[n.upazila]) map[n.upazila] = { count: 0, plants: 0, withMobile: 0, withGps: 0 }
      map[n.upazila].count++
      map[n.upazila].plants += n.pivot_total_plants
      if (n.mobile) map[n.upazila].withMobile++
      if (n.latitude && n.latitude !== 0) map[n.upazila].withGps++
    })
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count)
  }, [nurseries])

  const getGpsStatusColor = useCallback((status: string | null) => {
    if (!status) return 'default'
    if (status.includes('বৈধ') || status.includes('✓')) return 'default'
    if (status.includes('নেই') || status.includes('✗')) return 'destructive'
    return 'secondary'
  }, [])

  const getPriorityColor = useCallback((priority: string | null) => {
    if (!priority) return 'secondary'
    if (priority.includes('জরুরি')) return 'destructive'
    if (priority.includes('মোবাইল নেই')) return 'outline'
    if (priority.includes('সম্পন্ন')) return 'default'
    return 'secondary'
  }, [])

  const getCategoryIcon = (cat: string) => {
    switch(cat) {
      case 'Fruit': return <Flower2 className="w-3.5 h-3.5 text-orange-500" />
      case 'Forest': return <TreePine className="w-3.5 h-3.5 text-green-600" />
      case 'Medicinal': return <Pill className="w-3.5 h-3.5 text-purple-500" />
      default: return <Leaf className="w-3.5 h-3.5" />
    }
  }

  const getCategoryBadgeVariant = (cat: string): "default" | "secondary" | "destructive" | "outline" => {
    switch(cat) {
      case 'Fruit': return 'default'
      case 'Forest': return 'secondary'
      case 'Medicinal': return 'destructive'
      default: return 'outline'
    }
  }

  const formatNumber = (num: number) => {
    if (!num && num !== 0) return '0'
    return num.toLocaleString('en-IN')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto" />
          <p className="text-muted-foreground text-sm">Loading nursery data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-green-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/20">
                <TreePine className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Nursery Registry</h1>
                <p className="text-xs text-muted-foreground hidden sm:block">Kurigram District - GIS & Inventory Management</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-medium border-green-200 text-green-700 bg-green-50">
                <Hash className="w-3 h-3 mr-1" />
                {filteredNurseries.length} / {stats.total} Nurseries
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:px-6 space-y-4">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          <Card className="border-green-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-xs text-muted-foreground">Total Nurseries</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-green-700">{stats.total}</p>
              <div className="flex gap-2 mt-1">
                <span className="text-[10px] text-muted-foreground">{upazilas.length} upazilas</span>
              </div>
            </CardContent>
          </Card>
          <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <PhoneCall className="w-4 h-4 text-blue-600" />
                <span className="text-xs text-muted-foreground">With Mobile</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-blue-700">{stats.withMobile}</p>
              <Progress value={(stats.withMobile / stats.total) * 100} className="h-1.5 mt-1.5" />
              <p className="text-[10px] text-red-400 mt-0.5">{stats.noMobile} missing</p>
            </CardContent>
          </Card>
          <Card className="border-orange-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Navigation className="w-4 h-4 text-orange-600" />
                <span className="text-xs text-muted-foreground">With GPS</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-orange-700">{stats.withGps}</p>
              <Progress value={(stats.withGps / stats.total) * 100} className="h-1.5 mt-1.5" />
              <p className="text-[10px] text-red-400 mt-0.5">{stats.noGps} missing</p>
            </CardContent>
          </Card>
          <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-1">
                <Layers className="w-4 h-4 text-emerald-600" />
                <span className="text-xs text-muted-foreground">Total Plants</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-emerald-700">{formatNumber(stats.totalPlants)}</p>
              <div className="flex gap-3 mt-0.5">
                <span className="text-[10px] text-muted-foreground">S: {formatNumber(stats.totalSeedlings)}</span>
                <span className="text-[10px] text-muted-foreground">G: {formatNumber(stats.totalGrafts)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upazila Distribution Summary */}
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-green-600" />
              Upazila-wise Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-2">
              {upazilaStats.map(([upazila, data]) => (
                <button
                  key={upazila}
                  onClick={() => setSelectedUpazila(selectedUpazila === upazila ? 'all' : upazila)}
                  className={`text-left p-2 rounded-lg border transition-all text-xs ${
                    selectedUpazila === upazila 
                      ? 'bg-green-50 border-green-300 shadow-sm' 
                      : 'bg-white border-gray-100 hover:border-green-200 hover:bg-green-50/50'
                  }`}
                >
                  <p className="font-semibold text-gray-800 leading-tight text-[11px]">{upazila}</p>
                  <p className="text-green-700 font-bold text-sm mt-0.5">{data.count}</p>
                  <div className="flex gap-1 mt-1">
                    <span className="text-[9px] text-blue-500" title="With Mobile">📱{data.withMobile}</span>
                    <span className="text-[9px] text-orange-500" title="With GPS">📍{data.withGps}</span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <Card className="shadow-sm border-gray-100">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, address, mobile..."
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Upazila Filter */}
              <Select value={selectedUpazila} onValueChange={setSelectedUpazila}>
                <SelectTrigger className="w-[140px] sm:w-[160px] h-9 text-xs">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Upazila" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Upazilas</SelectItem>
                  {upazilas.map(u => (
                    <SelectItem key={u} value={u}>{u}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Category Filter */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[120px] sm:w-[140px] h-9 text-xs">
                  <Leaf className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Mobile Filter */}
              <Select value={hasMobileFilter} onValueChange={setHasMobileFilter}>
                <SelectTrigger className="w-[110px] sm:w-[130px] h-9 text-xs">
                  <Phone className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Mobile" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Mobile</SelectItem>
                  <SelectItem value="yes">Has Mobile</SelectItem>
                  <SelectItem value="no">No Mobile</SelectItem>
                </SelectContent>
              </Select>

              {/* GPS Filter */}
              <Select value={hasGpsFilter} onValueChange={setHasGpsFilter}>
                <SelectTrigger className="w-[100px] sm:w-[120px] h-9 text-xs">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="GPS" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any GPS</SelectItem>
                  <SelectItem value="yes">Has GPS</SelectItem>
                  <SelectItem value="no">No GPS</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[120px] sm:w-[140px] h-9 text-xs">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="serial">Serial #</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="upazila">Upazila</SelectItem>
                  <SelectItem value="plants-desc">Most Plants</SelectItem>
                  <SelectItem value="plants-asc">Fewest Plants</SelectItem>
                </SelectContent>
              </Select>

              {/* Reset */}
              {(searchQuery || selectedUpazila !== 'all' || selectedCategory !== 'all' || hasMobileFilter !== 'all' || hasGpsFilter !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-xs text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedUpazila('all')
                    setSelectedCategory('all')
                    setHasMobileFilter('all')
                    setHasGpsFilter('all')
                  }}
                >
                  Clear All
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="space-y-2 pb-8">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground">
              Showing {filteredNurseries.length} of {stats.total} nurseries
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0 text-xs"
                onClick={() => setViewMode('list')}
              >
                <List className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant={viewMode === 'map' ? 'default' : 'ghost'}
                size="sm"
                className="h-7 w-7 p-0 text-xs"
                onClick={() => setViewMode('map')}
              >
                <Map className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <Card className="shadow-sm border-gray-100">
              <CardContent className="p-0">
                <div className="w-full h-[500px] sm:h-[600px] relative bg-emerald-50 rounded-t-lg overflow-hidden">
                  <iframe
                    title="Nursery Map"
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=89.3%2C25.4%2C89.9%2C26.0&layer=mapnik&marker=${filteredNurseries
                      .filter(n => n.latitude && n.longitude)
                      .map(n => `${n.latitude},${n.longitude}`)
                      .join('&marker=')}`}
                    className="border-0"
                  />
                  {filteredNurseries.filter(n => n.latitude && n.longitude).length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                      <p className="text-muted-foreground text-sm">No nurseries with GPS in current filter</p>
                    </div>
                  )}
                </div>
                <div className="p-3 text-xs text-muted-foreground border-t">
                  Showing {filteredNurseries.filter(n => n.latitude && n.longitude).length} nurseries on map
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredNurseries.length === 0 ? (
                <Card className="shadow-sm">
                  <CardContent className="py-12 text-center">
                    <Search className="w-8 h-8 mx-auto text-muted-foreground mb-3" />
                    <p className="text-sm text-muted-foreground">No nurseries match your filters</p>
                    <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => {
                      setSearchQuery('')
                      setSelectedUpazila('all')
                      setSelectedCategory('all')
                      setHasMobileFilter('all')
                      setHasGpsFilter('all')
                    }}>
                      Reset Filters
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredNurseries.map((nursery, index) => (
                  <Card
                    key={`${nursery.owner}-${nursery.upazila}-${index}`}
                    className="shadow-sm hover:shadow-md transition-all border-gray-100 hover:border-green-200 group"
                  >
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          {/* Row 1: Serial + Name + Badges */}
                          <div className="flex items-start gap-2 mb-1.5">
                            {nursery.registry_serial && (
                              <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded mt-0.5 shrink-0">
                                #{nursery.registry_serial}
                              </span>
                            )}
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-sm text-gray-900 truncate leading-tight">
                                {nursery.owner}
                              </h3>
                              {nursery.address && (
                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                  {nursery.address}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Row 2: Upazila + Contact + GPS badges */}
                          <div className="flex flex-wrap items-center gap-1.5 mb-2">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-emerald-200 text-emerald-700">
                              <MapPin className="w-2.5 h-2.5 mr-0.5" />
                              {nursery.upazila}
                            </Badge>

                            {nursery.mobile ? (
                              <a href={`tel:${nursery.mobile}`} className="inline-flex">
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-blue-200 text-blue-700 hover:bg-blue-50 cursor-pointer">
                                  <Phone className="w-2.5 h-2.5 mr-0.5" />
                                  {nursery.mobile}
                                </Badge>
                              </a>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-red-200 text-red-400">
                                <Phone className="w-2.5 h-2.5 mr-0.5" />
                                No Mobile
                              </Badge>
                            )}

                            {nursery.latitude && nursery.latitude !== 0 ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-orange-200 text-orange-700">
                                <Navigation className="w-2.5 h-2.5 mr-0.5" />
                                GPS ✓
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-gray-200 text-gray-400">
                                <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
                                No GPS
                              </Badge>
                            )}

                            {nursery.gps_status && (
                              <Badge variant={getGpsStatusColor(nursery.gps_status)} className="text-[10px] px-1.5 py-0">
                                {nursery.gps_status}
                              </Badge>
                            )}

                            {nursery.priority && (
                              <Badge variant={getPriorityColor(nursery.priority)} className="text-[10px] px-1.5 py-0">
                                {nursery.priority}
                              </Badge>
                            )}

                            {nursery.has_pivot_data && (
                              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-emerald-50 text-emerald-700">
                                <ClipboardList className="w-2.5 h-2.5 mr-0.5" />
                                Inventory
                              </Badge>
                            )}
                          </div>

                          {/* Row 3: Stats */}
                          <div className="flex flex-wrap gap-3 text-[11px]">
                            <span className="text-gray-600">
                              <strong className="text-emerald-700">{formatNumber(nursery.pivot_total_plants)}</strong> plants
                            </span>
                            <span className="text-gray-600">
                              <strong className="text-blue-700">{formatNumber(nursery.pivot_total_seedlings)}</strong> seedlings
                            </span>
                            <span className="text-gray-600">
                              <strong className="text-amber-700">{formatNumber(nursery.pivot_total_grafts)}</strong> grafts
                            </span>
                            {nursery.total_seedlings > 0 && (
                              <span className="text-gray-500">
                                Registry: <strong>{formatNumber(nursery.total_seedlings)}</strong>
                              </span>
                            )}
                          </div>

                          {/* GPS coordinates */}
                          {nursery.latitude && nursery.longitude && nursery.latitude !== 0 && (
                            <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                              📍 {nursery.latitude}, {nursery.longitude}
                            </p>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col gap-1 shrink-0">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => setSelectedNursery(nursery)}
                              >
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle className="text-base">Nursery Details</DialogTitle>
                              </DialogHeader>
                              <NurseryDetail nursery={nursery} />
                            </DialogContent>
                          </Dialog>

                          {nursery.maps_link && (
                            <a href={nursery.maps_link} target="_blank" rel="noopener noreferrer">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-blue-600"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Map
                              </Button>
                            </a>
                          )}

                          {nursery.latitude && nursery.longitude && nursery.latitude !== 0 && !nursery.maps_link && (
                            <a href={`https://www.google.com/maps?q=${nursery.latitude},${nursery.longitude}`} target="_blank" rel="noopener noreferrer">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-blue-600"
                              >
                                <ExternalLink className="w-3 h-3 mr-1" />
                                Map
                              </Button>
                            </a>
                          )}

                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-xs"
                            onClick={() => setExpandedNursery(expandedNursery === index ? null : index)}
                          >
                            {expandedNursery === index ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      {/* Expanded Inventory */}
                      {expandedNursery === index && nursery.pivot_inventory.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-medium text-gray-600 mb-2">Detailed Inventory ({nursery.pivot_inventory.length} items)</p>
                          <div className="max-h-60 overflow-y-auto">
                            <table className="w-full text-[11px]">
                              <thead className="sticky top-0 bg-white">
                                <tr className="border-b border-gray-100">
                                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">Category</th>
                                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">Plant</th>
                                  <th className="text-left py-1 px-2 font-medium text-muted-foreground">Age</th>
                                  <th className="text-right py-1 px-2 font-medium text-muted-foreground">Total</th>
                                  <th className="text-right py-1 px-2 font-medium text-muted-foreground">Seedlings</th>
                                  <th className="text-right py-1 px-2 font-medium text-muted-foreground">Grafts</th>
                                </tr>
                              </thead>
                              <tbody>
                                {nursery.pivot_inventory
                                  .filter(item => item.total > 0 || item.seedlings > 0 || item.grafts > 0)
                                  .map((item, i) => (
                                    <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                                      <td className="py-1 px-2">
                                        <span className="inline-flex items-center gap-1">
                                          {getCategoryIcon(item.category)}
                                          {item.category}
                                        </span>
                                      </td>
                                      <td className="py-1 px-2 font-medium">{item.plant_name || '—'}</td>
                                      <td className="py-1 px-2 text-muted-foreground">{item.age_group || '—'}</td>
                                      <td className="py-1 px-2 text-right font-semibold text-emerald-700">{formatNumber(item.total)}</td>
                                      <td className="py-1 px-2 text-right text-blue-600">{formatNumber(item.seedlings)}</td>
                                      <td className="py-1 px-2 text-right text-amber-600">{formatNumber(item.grafts)}</td>
                                    </tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>

                          {/* Category summary */}
                          <div className="flex gap-3 mt-2 flex-wrap">
                            {(() => {
                              const cats: Record<string, { total: number; items: number }> = {}
                              nursery.pivot_inventory.forEach(item => {
                                if (!cats[item.category]) cats[item.category] = { total: 0, items: 0 }
                                cats[item.category].total += item.total
                                cats[item.category].items++
                              })
                              return Object.entries(cats).map(([cat, data]) => (
                                <Badge key={cat} variant={getCategoryBadgeVariant(cat)} className="text-[10px]">
                                  {getCategoryIcon(cat as string)}
                                  <span className="ml-0.5">{cat}: {formatNumber(data.total)} ({data.items} types)</span>
                                </Badge>
                              ))
                            })()}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

function NurseryDetail({ nursery }: { nursery: Nursery }) {
  const formatNumber = (num: number) => {
    if (!num && num !== 0) return '0'
    return num.toLocaleString('en-IN')
  }

  return (
    <div className="space-y-4 text-sm">
      {/* Owner & Contact */}
      <div className="space-y-2">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-0.5">Owner / Nursery</p>
          <p className="font-semibold">{nursery.owner}</p>
        </div>
        {nursery.address && (
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Address</p>
            <p>{nursery.address}</p>
          </div>
        )}
        <div className="flex gap-4">
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Mobile</p>
            {nursery.mobile ? (
              <a href={`tel:${nursery.mobile}`} className="text-blue-600 hover:underline font-medium flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" />
                {nursery.mobile}
              </a>
            ) : (
              <span className="text-red-400 flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5" />
                Not Available
              </span>
            )}
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Upazila</p>
            <p className="font-medium">{nursery.upazila}</p>
          </div>
        </div>
      </div>

      <Separator />

      {/* GPS */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">GPS Coordinates</p>
        {nursery.latitude && nursery.longitude && nursery.latitude !== 0 ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="font-mono text-xs">{nursery.latitude}, {nursery.longitude}</span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${nursery.latitude},${nursery.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              Open in Google Maps
            </a>
            {nursery.maps_link && (
              <div>
                <a
                  href={nursery.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Alternative Map Link
                </a>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-xs">GPS coordinates not available</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Inventory Summary */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Inventory Summary</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-2 bg-orange-50 rounded-lg">
            <p className="text-lg font-bold text-orange-700">{formatNumber(nursery.fruit_seedlings)}</p>
            <p className="text-[10px] text-orange-600">Fruit Seedlings</p>
          </div>
          <div className="text-center p-2 bg-green-50 rounded-lg">
            <p className="text-lg font-bold text-green-700">{formatNumber(nursery.forest_seedlings)}</p>
            <p className="text-[10px] text-green-600">Forest Seedlings</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded-lg">
            <p className="text-lg font-bold text-purple-700">{formatNumber(nursery.medicinal_seedlings)}</p>
            <p className="text-[10px] text-purple-600">Medicinal Seedlings</p>
          </div>
        </div>
        <div className="mt-3 text-center p-2 bg-emerald-50 rounded-lg">
          <p className="text-xl font-bold text-emerald-700">{formatNumber(nursery.total_seedlings)}</p>
          <p className="text-[10px] text-emerald-600">Total Seedlings (Registry)</p>
        </div>
      </div>

      {nursery.has_pivot_data && nursery.pivot_inventory.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Detailed Inventory ({nursery.pivot_inventory.length} entries)
            </p>
            <div className="max-h-60 overflow-y-auto rounded-lg border">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted">
                  <tr>
                    <th className="text-left py-1.5 px-2 font-medium">Category</th>
                    <th className="text-left py-1.5 px-2 font-medium">Plant</th>
                    <th className="text-left py-1.5 px-2 font-medium">Age</th>
                    <th className="text-right py-1.5 px-2 font-medium">Total</th>
                    <th className="text-right py-1.5 px-2 font-medium">Sdlng</th>
                    <th className="text-right py-1.5 px-2 font-medium">Graft</th>
                  </tr>
                </thead>
                <tbody>
                  {nursery.pivot_inventory
                    .filter(item => item.total > 0 || item.seedlings > 0 || item.grafts > 0)
                    .map((item, i) => (
                      <tr key={i} className="border-t">
                        <td className="py-1 px-2">{item.category}</td>
                        <td className="py-1 px-2 font-medium">{item.plant_name || '—'}</td>
                        <td className="py-1 px-2 text-muted-foreground">{item.age_group || '—'}</td>
                        <td className="py-1 px-2 text-right font-semibold">{formatNumber(item.total)}</td>
                        <td className="py-1 px-2 text-right text-blue-600">{formatNumber(item.seedlings)}</td>
                        <td className="py-1 px-2 text-right text-amber-600">{formatNumber(item.grafts)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <div className="text-center p-1.5 bg-emerald-50 rounded">
                <p className="text-sm font-bold text-emerald-700">{formatNumber(nursery.pivot_total_plants)}</p>
                <p className="text-[9px] text-emerald-600">Total Plants</p>
              </div>
              <div className="text-center p-1.5 bg-blue-50 rounded">
                <p className="text-sm font-bold text-blue-700">{formatNumber(nursery.pivot_total_seedlings)}</p>
                <p className="text-[9px] text-blue-600">Seedlings</p>
              </div>
              <div className="text-center p-1.5 bg-amber-50 rounded">
                <p className="text-sm font-bold text-amber-700">{formatNumber(nursery.pivot_total_grafts)}</p>
                <p className="text-[9px] text-amber-600">Grafts</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Registration Info */}
      {nursery.main_variety && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-0.5">Main Variety</p>
            <p>{nursery.main_variety}</p>
          </div>
        </>
      )}

      {nursery.verification && (
        <div className="flex items-center gap-2">
          {nursery.verification.includes('সম্পন্ন') || nursery.verification.includes('✓') ? (
            <CheckCircle2 className="w-4 h-4 text-green-500" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-orange-500" />
          )}
          <span className="text-xs">{nursery.verification}</span>
        </div>
      )}
    </div>
  )
}
