/**
 * Properties panel for editing block data
 */
import { useState, useEffect } from 'react';
import { Block, BlockType } from '@/core/models/types';
import { LogicDocument } from '@/core/crdt/document';
import { blockRegistry } from '@/core/blocks/registry';
import { useToast } from '../hooks/useToast';
import { ConfirmDialog } from '../components/ConfirmDialog';
import './BlockPropertiesPanel.css';

interface BlockPropertiesPanelProps {
  block: Block | null;
  document: LogicDocument;
  onClose: () => void;
}

export function BlockPropertiesPanel({
  block,
  document,
  onClose,
}: BlockPropertiesPanelProps) {
  const [label, setLabel] = useState('');
  const [data, setData] = useState<Record<string, any>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    if (block) {
      setLabel(block.label || '');
      setData({ ...block.data });
    }
  }, [block]);

  if (!block) {
    return null;
  }

  const handleSave = () => {
    document.updateBlock(block.id, {
      label: label || undefined,
      data: { ...data },
    });
    success('Block updated successfully');
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    document.deleteBlock(block.id);
    setShowDeleteConfirm(false);
    onClose();
    success('Block deleted');
  };

  const getPropertyFields = (blockType: BlockType) => {
    // Get block definition from registry
    const definition = blockRegistry.get(block.id);
    
    if (definition && definition.properties.length > 0) {
      return definition.properties.map((prop) => (
        <div key={prop.id} className="property-field">
          <label>{prop.name}</label>
          {prop.type === 'code' ? (
            <textarea
              value={data[prop.id] || prop.template || ''}
              onChange={(e) => setData({ ...data, [prop.id]: e.target.value })}
              placeholder={prop.placeholder || prop.description}
              rows={6}
              className="property-field__code"
            />
          ) : prop.type === 'json' ? (
            <textarea
              value={typeof data[prop.id] === 'string' ? data[prop.id] : JSON.stringify(data[prop.id] || prop.default || {}, null, 2)}
              onChange={(e) => {
                try {
                  const parsed = e.target.value ? JSON.parse(e.target.value) : {};
                  setData({ ...data, [prop.id]: parsed });
                } catch (err) {
                  // Invalid JSON, keep as string
                  setData({ ...data, [prop.id]: e.target.value });
                }
              }}
              placeholder={prop.placeholder || '{}'}
              rows={4}
              className="property-field__code"
            />
          ) : prop.type === 'select' ? (
            <select
              value={data[prop.id] || prop.default || ''}
              onChange={(e) => setData({ ...data, [prop.id]: e.target.value })}
            >
              {prop.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : prop.type === 'number' ? (
            <input
              type="number"
              value={data[prop.id] ?? prop.default ?? ''}
              onChange={(e) => setData({ ...data, [prop.id]: parseFloat(e.target.value) || 0 })}
              placeholder={prop.placeholder}
            />
          ) : prop.type === 'boolean' ? (
            <input
              type="checkbox"
              checked={data[prop.id] ?? prop.default ?? false}
              onChange={(e) => setData({ ...data, [prop.id]: e.target.checked })}
            />
          ) : prop.type === 'textarea' ? (
            <textarea
              value={data[prop.id] || prop.default || ''}
              onChange={(e) => setData({ ...data, [prop.id]: e.target.value })}
              placeholder={prop.placeholder}
              rows={3}
            />
          ) : (
            <input
              type="text"
              value={data[prop.id] || prop.default || ''}
              onChange={(e) => setData({ ...data, [prop.id]: e.target.value })}
              placeholder={prop.placeholder}
            />
          )}
          {prop.description && (
            <div className="property-field__hint">{prop.description}</div>
          )}
        </div>
      ));
    }

    // Fallback to old switch statement for backward compatibility
    switch (blockType) {
      case 'trigger':
        return (
          <>
            <div className="property-field">
              <label>Event Name</label>
              <input
                type="text"
                value={data.eventName || ''}
                onChange={(e) =>
                  setData({ ...data, eventName: e.target.value })
                }
                placeholder="e.g., On Click, On Load"
              />
            </div>
            <div className="property-field">
              <label>Description</label>
              <textarea
                value={data.description || ''}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
                placeholder="What triggers this?"
                rows={3}
              />
            </div>
          </>
        );
      case 'action':
        return (
          <>
            <div className="property-field">
              <label>Action Name</label>
              <input
                type="text"
                value={data.actionName || ''}
                onChange={(e) =>
                  setData({ ...data, actionName: e.target.value })
                }
                placeholder="e.g., Send Email, Log Message"
              />
            </div>
            <div className="property-field">
              <label>Message/Content</label>
              <textarea
                value={data.message || ''}
                onChange={(e) => setData({ ...data, message: e.target.value })}
                placeholder="Enter the action content..."
                rows={4}
              />
            </div>
            <div className="property-field">
              <label>Parameters (JSON)</label>
              <textarea
                value={data.parameters ? JSON.stringify(data.parameters, null, 2) : ''}
                onChange={(e) => {
                  try {
                    const parsed = e.target.value ? JSON.parse(e.target.value) : {};
                    setData({ ...data, parameters: parsed });
                  } catch (err) {
                    // Invalid JSON, keep as string for now
                    setData({ ...data, parameters: e.target.value });
                  }
                }}
                placeholder='{"key": "value"}'
                rows={3}
              />
            </div>
          </>
        );
      case 'condition':
        return (
          <>
            <div className="property-field">
              <label>Condition Type</label>
              <select
                value={data.conditionType || 'equals'}
                onChange={(e) =>
                  setData({ ...data, conditionType: e.target.value })
                }
              >
                <option value="equals">Equals</option>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
                <option value="contains">Contains</option>
                <option value="exists">Exists</option>
              </select>
            </div>
            <div className="property-field">
              <label>Left Value</label>
              <input
                type="text"
                value={data.leftValue || ''}
                onChange={(e) =>
                  setData({ ...data, leftValue: e.target.value })
                }
                placeholder="Variable or value"
              />
            </div>
            <div className="property-field">
              <label>Right Value</label>
              <input
                type="text"
                value={data.rightValue || ''}
                onChange={(e) =>
                  setData({ ...data, rightValue: e.target.value })
                }
                placeholder="Variable or value"
              />
            </div>
          </>
        );
      case 'transform':
        return (
          <>
            <div className="property-field">
              <label>Transform Type</label>
              <select
                value={data.transformType || 'format'}
                onChange={(e) =>
                  setData({ ...data, transformType: e.target.value })
                }
              >
                <option value="format">Format</option>
                <option value="parse">Parse</option>
                <option value="map">Map</option>
                <option value="filter">Filter</option>
                <option value="reduce">Reduce</option>
              </select>
            </div>
            <div className="property-field">
              <label>Expression</label>
              <textarea
                value={data.expression || ''}
                onChange={(e) =>
                  setData({ ...data, expression: e.target.value })
                }
                placeholder="Enter transformation expression..."
                rows={3}
              />
            </div>
          </>
        );
      case 'variable':
        return (
          <>
            <div className="property-field">
              <label>Variable Name</label>
              <input
                type="text"
                value={data.variableName || ''}
                onChange={(e) =>
                  setData({ ...data, variableName: e.target.value })
                }
                placeholder="e.g., counter, userData"
              />
            </div>
            <div className="property-field">
              <label>Initial Value</label>
              <input
                type="text"
                value={data.initialValue || ''}
                onChange={(e) =>
                  setData({ ...data, initialValue: e.target.value })
                }
                placeholder="Default value"
              />
            </div>
            <div className="property-field">
              <label>Variable Type</label>
              <select
                value={data.variableType || 'string'}
                onChange={(e) =>
                  setData({ ...data, variableType: e.target.value })
                }
              >
                <option value="string">String</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean</option>
                <option value="object">Object</option>
                <option value="array">Array</option>
              </select>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="block-properties-panel">
      <div className="block-properties-panel__header">
        <h3>Block Properties</h3>
        <button
          className="block-properties-panel__close"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
      </div>

      <div className="block-properties-panel__content">
        <div className="property-field">
          <label>Block Label</label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Display name"
          />
        </div>

        <div className="property-field">
          <label>Block Type</label>
          <input
            type="text"
            value={block.type}
            disabled
            className="property-field__disabled"
          />
        </div>

        <div className="property-field">
          <label>Block ID</label>
          <input
            type="text"
            value={block.id}
            disabled
            className="property-field__disabled"
          />
        </div>

        <div className="property-divider" />

        {getPropertyFields(block.type)}

        <div className="property-divider" />

        <div className="property-field">
          <label>Raw Data (JSON)</label>
          <textarea
            value={JSON.stringify(data, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setData(parsed);
              } catch (err) {
                // Invalid JSON, ignore
              }
            }}
            rows={6}
            className="property-field__code"
          />
        </div>
      </div>

      <div className="block-properties-panel__footer">
        <button
          className="block-properties-panel__button block-properties-panel__button--delete"
          onClick={handleDelete}
        >
          Delete Block
        </button>
        <button
          className="block-properties-panel__button block-properties-panel__button--save"
          onClick={handleSave}
        >
          Save Changes
        </button>
      </div>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="Delete Block"
        message="Are you sure you want to delete this block? All connections to this block will also be removed."
        confirmText="Delete"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
