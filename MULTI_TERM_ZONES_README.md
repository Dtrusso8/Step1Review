# Multi-Term Zone Implementation

This document describes the implementation of Goal 1: Allow multiple correct terms per drop zone in the Drag & Drop Activity application.

## Overview

The application now supports drop zones that can accept multiple terms, with configurable minimum and maximum label requirements. This enables more flexible and realistic educational scenarios where students need to place multiple related terms in the same location.

## New Zone Schema

### Zone Properties

Each drop zone now has the following properties:

```json
{
  "id": "z1",
  "x": 12.3, "y": 45.6, "w": 20, "h": 10,               // % values
  "acceptedTerms": ["Aorta", "Pulmonary Artery"],        // Array of accepted terms
  "minRequired": 1,                                      // Minimum labels required
  "maxAllowed": 1,                                       // Maximum labels allowed (null = unlimited)
  "decoy": false                                         // Whether this is a decoy zone
}
```

### Backward Compatibility

Legacy zones with the old `term` property are automatically converted at runtime:

- `term: "Aorta"` → `acceptedTerms: ["Aorta"]`, `minRequired: 1`, `maxAllowed: 1`, `decoy: false`

## Teacher Mode Features

### Zone Configuration Panel

When a zone is selected, the configuration panel now includes:

1. **Decoy Zone Checkbox**: When checked, the zone rejects all drops and disables other configuration fields
2. **Accepted Terms Multi-Select**: Searchable checklist of all available terms
3. **Min Labels Required**: Number input for minimum required labels (default: 1, floor: 0)
4. **Max Labels Allowed**: Number input with "No limit" checkbox option

### Validation

The system validates zone configuration before allowing switch to Student Mode:

- Non-decoy zones must have at least one accepted term
- `minRequired` must be ≥ 0
- `maxAllowed` must be ≥ `minRequired` (if not unlimited)

## Student Mode Features

### Label Inventory

- **Single-term zones**: Keep existing bounded counts per term (badge decrements)
- **Multi-term zones**: Treat terms as unbounded supply (no count badge) to avoid complex preallocation math

### Drop Logic

1. **Decoy zones**: Reject all drops with message "This is a decoy zone - no labels can be placed here!"
2. **Term validation**: Reject terms not in `acceptedTerms` array
3. **Capacity check**: Reject drops when `maxAllowed` is reached
4. **Label cloning**: Clone labels into zones (don't move originals) so same term can be used elsewhere

### Label Removal

- Click ✕ button on placed labels to remove them
- Restores original tile badge count if bounded
- Updates progress and zone appearance

## Completion & Scoring

### Zone Correctness

A non-decoy zone is correct when:
- `minRequired` ≤ placedCount ≤ (`maxAllowed` || ∞)
- Every placed term ∈ `acceptedTerms`

A decoy zone is correct when:
- No labels are placed

### Progress Display

Progress now shows "Zones correct: X / N" instead of "X of Y labels placed correctly"

### Activity Completion

Activity is complete when all zones satisfy their rules:
- Non-decoy zones meet their requirements
- Decoy zones are empty

## Technical Implementation

### Data Model Changes

- `term` property replaced with `acceptedTerms` array
- Added `minRequired`, `maxAllowed`, and `decoy` properties
- Backward compatibility through runtime conversion

### UI Updates

- Zone configuration panel redesigned for multi-term support
- Terms displayed as checkboxes instead of single dropdown
- Decoy zone toggle with conditional field disabling
- Min/max label inputs with validation

### Drag & Drop Logic

- Updated to handle multiple labels per zone
- Zone capacity checking
- Label cloning instead of moving
- Remove button functionality

### CSS Updates

- `.placed-labels` container for multiple labels
- `.placed-label` styling for individual chips
- `.remove-label-btn` for label removal
- Responsive layout with flexbox wrapping

## Usage Examples

### Example 1: Multiple Correct Terms

```json
{
  "id": "zone-1",
  "acceptedTerms": ["Aorta", "Pulmonary Artery", "Vena Cava"],
  "minRequired": 2,
  "maxAllowed": 3,
  "decoy": false
}
```

Students must place at least 2 and at most 3 of the accepted terms.

### Example 2: Decoy Zone

```json
{
  "id": "zone-2",
  "acceptedTerms": [],
  "minRequired": 0,
  "maxAllowed": null,
  "decoy": true
}
```

This zone rejects all drops and is correct when empty.

### Example 3: Unlimited Labels

```json
{
  "id": "zone-3",
  "acceptedTerms": ["Mitochondria", "Endoplasmic Reticulum"],
  "minRequired": 1,
  "maxAllowed": null,
  "decoy": false
}
```

Students can place any number of accepted terms (minimum 1).

## Migration Guide

### For Existing Activities

1. **Automatic Conversion**: Legacy zones are automatically converted on load
2. **Manual Review**: Review converted zones and adjust settings as needed
3. **Save Setup**: Use "Save to File" to create new setup files with v2.0 schema

### For New Activities

1. **Create Zones**: Add drop zones as usual
2. **Configure Terms**: Select multiple accepted terms per zone
3. **Set Requirements**: Configure min/max label requirements
4. **Add Decoys**: Optionally add decoy zones for incorrect locations

## Testing

A test file (`test.html`) is provided to verify:

1. **Legacy Zone Conversion**: Backward compatibility
2. **Zone Validation**: Configuration validation logic
3. **Multi-Term Logic**: Completion logic for multiple terms
4. **Decoy Zone Logic**: Decoy zone behavior

## Future Enhancements

### Optional Advanced Features

- `labelCounts: { "term": number }` for hard-capping specific term counts
- Advanced UI options hidden behind "Advanced" toggle
- Zone templates for common configurations

### Performance Optimizations

- Lazy loading of zone validation
- Efficient label counting algorithms
- Optimized drag and drop hit testing

## Conclusion

The multi-term zone implementation provides a flexible and powerful foundation for creating more sophisticated drag and drop activities. The backward compatibility ensures existing activities continue to work while new features enable more complex educational scenarios.

The system maintains the simple and clear user experience while adding the flexibility needed for advanced use cases. 