import { useState, useEffect } from 'react';
import { 
  Pencil, 
  GripVertical, 
  X, 
  Plus, 
  Check, 
  LayoutGrid,
  Save, 
  BarChart, 
  TrendingUp, 
  Users, 
  PieChart, 
  FileText, 
  Newspaper, 
  MessageSquare
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';

interface DashboardWidget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  data?: any;
  visible: boolean;
}

const WIDGET_TYPES = [
  { id: 'recent_analyses', icon: <FileText size={18} />, name: 'Recent Analyses' },
  { id: 'success_rate', icon: <PieChart size={18} />, name: 'Success Rate Trends' },
  { id: 'news', icon: <Newspaper size={18} />, name: 'Startup News' },
  { id: 'community', icon: <MessageSquare size={18} />, name: 'Community Posts' },
  { id: 'market_trends', icon: <TrendingUp size={18} />, name: 'Market Trends' },
  { id: 'competitors', icon: <Users size={18} />, name: 'Competitor Tracking' },
  { id: 'growth', icon: <BarChart size={18} />, name: 'Growth Metrics' },
];

// Default dashboard configuration
const DEFAULT_WIDGETS: DashboardWidget[] = [
  { id: '1', type: 'recent_analyses', title: 'Recent Analyses', size: 'medium', position: 0, visible: true },
  { id: '2', type: 'success_rate', title: 'Success Rate Trends', size: 'small', position: 1, visible: true },
  { id: '3', type: 'news', title: 'Startup News', size: 'medium', position: 2, visible: true },
  { id: '4', type: 'community', title: 'Community Posts', size: 'medium', position: 3, visible: true },
];

export function CustomizableDashboard() {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);
  const [showWidgetMenu, setShowWidgetMenu] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load saved dashboard configuration or use defaults
  useEffect(() => {
    const savedConfig = localStorage.getItem('dashboardConfig');
    if (savedConfig) {
      try {
        setWidgets(JSON.parse(savedConfig));
      } catch (e) {
        console.error('Error loading dashboard config:', e);
        setWidgets(DEFAULT_WIDGETS);
      }
    } else {
      setWidgets(DEFAULT_WIDGETS);
    }
  }, []);

  // Save dashboard configuration when it changes
  useEffect(() => {
    if (widgets.length > 0) {
      localStorage.setItem('dashboardConfig', JSON.stringify(widgets));
    }
  }, [widgets]);

  const handleDragStart = (id: string) => {
    if (!editMode) return;
    setDraggedWidget(id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!editMode || !draggedWidget || draggedWidget === id) return;

    // Find positions
    const draggedIndex = widgets.findIndex(w => w.id === draggedWidget);
    const hoverIndex = widgets.findIndex(w => w.id === id);

    // Swap positions
    const newWidgets = [...widgets];
    newWidgets[draggedIndex].position = hoverIndex;
    newWidgets[hoverIndex].position = draggedIndex;

    // Sort by position
    newWidgets.sort((a, b) => a.position - b.position);

    setWidgets(newWidgets);
  };

  const handleDragEnd = () => {
    setDraggedWidget(null);
  };

  const toggleWidgetVisibility = (id: string) => {
    setWidgets(widgets.map(widget => 
      widget.id === id 
        ? { ...widget, visible: !widget.visible } 
        : widget
    ));
  };

  const changeWidgetSize = (id: string) => {
    setWidgets(widgets.map(widget => {
      if (widget.id === id) {
        const sizes: ('small' | 'medium' | 'large')[] = ['small', 'medium', 'large'];
        const currentIndex = sizes.indexOf(widget.size);
        const nextSize = sizes[(currentIndex + 1) % sizes.length];
        return { ...widget, size: nextSize };
      }
      return widget;
    }));
  };

  const addWidget = (type: string) => {
    const widgetType = WIDGET_TYPES.find(w => w.id === type);
    if (!widgetType) return;

    const newId = Date.now().toString();
    const newWidget: DashboardWidget = {
      id: newId,
      type,
      title: widgetType.name,
      size: 'medium',
      position: widgets.length,
      visible: true
    };

    setWidgets([...widgets, newWidget]);
    setShowWidgetMenu(false);

    toast({
      title: 'Widget Added',
      description: `Added ${widgetType.name} to your dashboard`,
    });
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
  };

  const saveChanges = () => {
    setEditMode(false);
    toast({
      title: 'Dashboard Saved',
      description: 'Your dashboard layout has been saved',
    });
  };

  // Dummy widget content (would be replaced with real components)
  const renderWidgetContent = (widget: DashboardWidget) => {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        {WIDGET_TYPES.find(w => w.id === widget.type)?.icon}
        <p className="text-white/70 text-sm mt-2">
          {widget.title} content would go here
        </p>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          {user ? `Welcome, ${user.username}` : 'Dashboard'}
        </h2>
        
        <div className="flex items-center space-x-2">
          {editMode ? (
            <>
              <Button
                onClick={() => setShowWidgetMenu(!showWidgetMenu)}
                variant="outline"
                className="text-white border-vision-purple-200/20 hover:bg-vision-purple-100/10"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Widget
              </Button>
              
              <Button
                onClick={saveChanges}
                className="bg-vision-primary-gradient hover:brightness-110 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Layout
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setEditMode(true)}
              variant="outline"
              className="text-white border-vision-purple-200/20 hover:bg-vision-purple-100/10"
            >
              <Pencil className="w-4 h-4 mr-2" />
              Customize
            </Button>
          )}
        </div>
      </div>
      
      {/* Widget menu dropdown */}
      {showWidgetMenu && (
        <div className="vision-card p-4 mb-6 border border-vision-purple-200/20">
          <h3 className="text-white font-medium mb-3">Add Widgets</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {WIDGET_TYPES.map(type => (
              <Button
                key={type.id}
                onClick={() => addWidget(type.id)}
                variant="outline"
                className="flex flex-col h-24 items-center justify-center text-white border-vision-purple-200/20 hover:bg-vision-purple-100/10 hover:border-vision-purple-500"
              >
                <div className="text-vision-purple-500 mb-2">{type.icon}</div>
                <span className="text-xs text-center">{type.name}</span>
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Widgets grid */}
      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ${editMode ? 'bg-vision-purple-100/5 p-4 rounded-lg border border-dashed border-vision-purple-200/20' : ''}`}>
        {widgets
          .filter(widget => widget.visible || editMode)
          .sort((a, b) => a.position - b.position)
          .map(widget => (
            <div
              key={widget.id}
              draggable={editMode}
              onDragStart={() => handleDragStart(widget.id)}
              onDragOver={(e) => handleDragOver(e, widget.id)}
              onDragEnd={handleDragEnd}
              className={`
                vision-card p-4 border border-vision-purple-200/20 
                ${!widget.visible && editMode ? 'opacity-50' : ''}
                ${draggedWidget === widget.id ? 'border-vision-purple-500' : ''}
                ${editMode ? 'cursor-move' : ''}
                ${widget.size === 'small' ? 'col-span-1' : 
                  widget.size === 'medium' ? 'col-span-1 md:col-span-1' : 
                  'col-span-1 md:col-span-2 lg:col-span-3'}
              `}
              style={{ minHeight: '200px' }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-white">{widget.title}</h3>
                
                {editMode && (
                  <div className="flex items-center space-x-1">
                    <Button
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/70 hover:text-white hover:bg-vision-purple-100/10"
                    >
                      {widget.visible ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                    </Button>
                    
                    <Button
                      onClick={() => changeWidgetSize(widget.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/70 hover:text-white hover:bg-vision-purple-100/10"
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => removeWidget(widget.id)}
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-white/70 hover:text-white hover:bg-vision-purple-100/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    
                    <div className="h-7 w-7 flex items-center justify-center text-white/40">
                      <GripVertical className="h-4 w-4" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="h-32 overflow-hidden">
                {renderWidgetContent(widget)}
              </div>
            </div>
          ))}
      </div>
      
      {/* Empty state if no widgets */}
      {widgets.filter(w => w.visible || editMode).length === 0 && (
        <div className="vision-card p-8 text-center">
          <p className="text-white/70 mb-4">No widgets to display</p>
          <Button
            onClick={() => {
              setEditMode(true);
              setShowWidgetMenu(true);
            }}
            variant="outline"
            className="text-white border-vision-purple-200/20 hover:bg-vision-purple-100/10"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Widgets
          </Button>
        </div>
      )}
    </div>
  );
}