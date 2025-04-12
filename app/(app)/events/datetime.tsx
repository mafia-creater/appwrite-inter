import { useState } from 'react';
import { TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

// Component to use in CreateEventScreen
const DateTimePickerField = ({ label, value, onChange, mode = 'date' }) => {
  const [show, setShow] = useState(false);
  const [dateTime, setDateTime] = useState(value ? new Date(value) : new Date());

  const handleChange = (event, selectedDate) => {
    const currentDate = selectedDate || dateTime;
    setShow(Platform.OS === 'ios');
    setDateTime(currentDate);
    
    // Format date or time based on mode
    let formattedValue = '';
    if (mode === 'date') {
      formattedValue = format(currentDate, 'yyyy-MM-dd');
    } else {
      formattedValue = format(currentDate, 'HH:mm');
    }
    
    onChange(formattedValue);
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.label}>{label} *</Text>
      <TouchableOpacity 
        style={styles.iconInput}
        onPress={() => setShow(true)}
      >
        {mode === 'date' ? 
          <Calendar size={20} color="#666" /> : 
          <Clock size={20} color="#666" />
        }
        <Text style={styles.iconTextInput}>
          {value || (mode === 'date' ? 'Select Date' : 'Select Time')}
        </Text>
      </TouchableOpacity>
      
      {show && (
        <DateTimePicker
          value={dateTime}
          mode={mode}
          is24Hour={true}
          display="default"
          onChange={handleChange}
        />
      )}
    </View>
  );
};