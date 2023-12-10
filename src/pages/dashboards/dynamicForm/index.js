// pages/index.js
import React, { useState } from 'react';
import { Button, FormControl, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import { styled } from '@mui/system';

const Container = styled('div')({
  margin: '16px',
});

const FieldContainer = styled('div')({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
});

const Field = styled('div')({
  marginRight: '16px',
  marginTop: "12px"
});

const DynamicForm = () => {
  const [fields, setFields] = useState([]);
  const [selectedField, setSelectedField] = useState('');
  const [fieldValue, setFieldValue] = useState('');

  const handleFieldChange = (event) => {
    setSelectedField(event.target.value);
  };

  const handleAddField = () => {
    if (selectedField && fieldValue) {
      setFields([...fields, { id: Date.now(), type: selectedField, value: fieldValue }]);
      setSelectedField('');
      setFieldValue('');
    }
  };

  return (
    <Container sx={{ width: "100%" }}>
      <h1>Dynamic Form</h1>
      <FieldContainer sx={{ gap: "10px" }}>
        <FormControl component={Field}>
          <InputLabel>Select Field Type</InputLabel>
          <Select value={selectedField} onChange={handleFieldChange}>
            <MenuItem value="text">Text Field</MenuItem>
            <MenuItem value="number">Number Field</MenuItem>
            <MenuItem value="select">Select Field</MenuItem>
          </Select>
        </FormControl>
        {selectedField && (
          <>
            <TextField
              component={Field}
              label={`Enter ${selectedField === 'select' ? 'Options' : 'Value'}`}
              value={fieldValue}
              onChange={(e) => setFieldValue(e.target.value)}
            />
            <Button variant="contained" color="primary" onClick={handleAddField}>
              Add Field
            </Button>
          </>
        )}
      </FieldContainer>
      {fields.length > 0 && (
        <div className='w-full gap-y-10'>
          <h2>Generated Fields</h2>
          <form>
            {fields.map((field) => (
              <FieldContainer sx={{ gap: "20px", display: "grid", gridRows: "3" }} key={field.id}>
                {field.type === 'select' ? (
                  <FormControl component={Field}>
                    <InputLabel>{field.type}</InputLabel>
                    <Select value={field.value}>
                      {field.value.split(',').map((option, i) => (
                        <MenuItem key={i} value={option.trim()}>
                          {option.trim()}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                ) : (
                  <TextField component={Field} label={field.type} value={field.value} />
                )}
              </FieldContainer>
            ))}
          </form>
        </div>
      )}
    </Container>
  );
};

export default DynamicForm;
