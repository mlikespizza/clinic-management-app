import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, Image, Text, Alert } from "react-native";
import { TextInput, Button } from 'react-native-paper';
import { DatePickerModal } from "react-native-paper-dates";
import * as SQLite from 'expo-sqlite';
import DropDown from "react-native-paper-dropdown";


const VisitationDataPage: React.FC = () => {
  const [db,setDb] = useState<any>()
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);

  const [selectedPatient, setSelectedPatient] = useState<number | null>(null);

  const [showDropDown, setShowDropDown] = useState(false);

  const [patients, setPatients] = useState([]);

  const [clinicDate, setClinicDate] = useState("");
  const [nextAppointmentDate, setNextAppointmentDate] = useState("");
  const [openClinicDate, setOpenClinicDate] = useState(false);
  const [openNextAppointmentDate, setOpenNextAppointmentDate] = useState(false);
  const [natureOfAilment, setnatureOfAilment] = useState("");
  const [medicinePrescribed, setmedicinePrescribed] = useState("");
  const [procedureUndertaken, setprocedureUndertaken] = useState("");


  const onDismissClinicDate = useCallback(() => {
    setOpenClinicDate(false);
  }, [setOpenClinicDate]);

  const onConfirmClinicDate = useCallback(
    (params) => {
      setOpenClinicDate(false);
      setClinicDate(params.date.toLocaleDateString());
    },
    [setOpenClinicDate, setClinicDate]
  );

  const onDismissNextAppointmentDate = useCallback(() => {
    setOpenNextAppointmentDate(false);
  }, [setOpenNextAppointmentDate]);

  const onConfirmNextAppointmentDate = useCallback(
    (params) => {
      setOpenNextAppointmentDate(false);
      setNextAppointmentDate(params.date.toLocaleDateString());
    },
    [setOpenNextAppointmentDate, setNextAppointmentDate]
  );
  const initializeDatabase = async () => {
    const db = await SQLite.openDatabaseAsync("marvClinic.db");
    setDb(db)

    try {
      await db.runAsync(`
      CREATE TABLE IF NOT EXISTS patient_visitation (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      patient_id INTEGER,
      visitation_date DATE,
      ailment TEXT,
      medicine TEXT,
      procedure TEXT,
      next_appointment_date DATE,
      FOREIGN KEY (patient_id) REFERENCES patients (id)
      );
      
      `);
    }
    catch (error) {
      console.error("There was an error when initializing database:", error);
    }

  };

  const insertPatientInfo = async () => {
    if (natureOfAilment !== "" || medicinePrescribed !== "" || procedureUndertaken !== "" || clinicDate !== "" || nextAppointmentDate !== "" || selectedPatient !== null) {
      const db = await SQLite.openDatabaseAsync("marvClinic.db");
      try {
        await db.runAsync(
          `INSERT INTO patient_visitation(patient_id,visitation_date,ailment,medicine,procedure,next_appointment_date) VALUES(?,?,?,?,?,?)`,
          [selectedPatient, clinicDate, natureOfAilment, medicinePrescribed, procedureUndertaken, nextAppointmentDate]
        );
        setSelectedPatient(null);
        setClinicDate("");
        setnatureOfAilment("");
        setmedicinePrescribed("");
        setprocedureUndertaken("");
        setNextAppointmentDate("");
        Alert.alert("Successful Input!", "Info has been successfully added to our database.");
      }

      catch (error: any) {
        console.log(error);
        Alert.alert("Error", "An error has occurred.");
      }
    }
    else {
      Alert.alert("Please fill all the required fields");
    }
  }


  const fetchPatientsList = async () => {
    const db = await SQLite.openDatabaseAsync("marvClinic.db");
    try {
      const retrievedPatientData = await db.getAllAsync(`
        SELECT * FROM patients 

      `)
      console.log(retrievedPatientData);
      const structuredPatientData = retrievedPatientData.map((record: any) => {
        return {
          label: `${record.first_name} ${record.middle_name} ${record.surname}  `,
          value: record.id
        }
      })
      setPatients(structuredPatientData);
    }
    catch (error) {
      console.error("There was an error retrieving data:", error);
    }
  };

  useEffect(() => {
    initializeDatabase();
    fetchPatientsList();
  }, [showDropDown]);


  return (
    <View style={{ paddingHorizontal: 30, flex: 1, backgroundColor: "#fff", gap: 10 }}>
      <Image
        resizeMode="contain"
        style={{ height: 75, width: "auto", marginTop: 40 }}
        source={require('../../assets/images/hospitallogo-removebg-preview.png')}
      />
      <Text style={{ color: '#000', fontSize: 20, marginVertical: 10 }}>Input patient details</Text>
      <DropDown
        label={"Select Patient"}
        mode={"outlined"}
        visible={showDropDown}
        showDropDown={() => {
          setShowDropDown(true);
        }}
        onDismiss={() => setShowDropDown(false)}
        value={selectedPatient}
        setValue={setSelectedPatient}
        list={patients}
        dropDownItemStyle={{ 
         
          backgroundColor:"#F5FCFF" }}
        theme={{
          colors: {
            primary: "#fefff8",
            background: "#fefff8",
            text: "black",
            placeholder: "#000",
          },
          fonts: {
            regular: {
              fontFamily: "sans-serif",
              fontWeight: "normal",
              color: "#000",
            },
          },
        }}
      />

      <Button textColor="#ccc" style={styles.buttons} onPress={() => setOpenClinicDate(true)} uppercase={false} mode="outlined">
        {clinicDate != "" ? clinicDate : "Select Clinic Date"}
      </Button>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={openClinicDate}
        onDismiss={onDismissClinicDate}
        date={clinicDate}
        onConfirm={onConfirmClinicDate}
      />
      <TextInput
        label="Nature of Ailment"
        style={styles.textInput}
        value={natureOfAilment}
        onChangeText={(natureOfAilment) => setnatureOfAilment(natureOfAilment)}
      />
      <TextInput
        label="Medicine Prescribed"
        style={styles.textInput}
        value={medicinePrescribed}
        onChangeText={(medicinePrescribed) => setmedicinePrescribed(medicinePrescribed)}
      />
      <TextInput
        label="Procedure Undertaken"
        style={styles.textInput}
        value={procedureUndertaken}
        onChangeText={(procedureUndertaken) => setprocedureUndertaken(procedureUndertaken)}
      />
      <Button textColor="#ccc" style={styles.buttons} onPress={() => setOpenNextAppointmentDate(true)} uppercase={false} mode="outlined">
        {nextAppointmentDate != "" ? nextAppointmentDate : "Select Date of Next Appointment"}
      </Button>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={openNextAppointmentDate}
        onDismiss={onDismissNextAppointmentDate}
        date={nextAppointmentDate}
        onConfirm={onConfirmNextAppointmentDate}
      />
      <Button  style={{backgroundColor:"#FDE74C"}} icon="check" mode="contained" onPress={insertPatientInfo}>
        Submit
      </Button>
    </View>
  );
};



const styles = StyleSheet.create({
  textInput: {
    // marginVertical: 10,
    // backgroundColor: "#FCF8DF"
    backgroundColor:"#fefff8",
    borderWidth:0,
    borderBottomColor:"#AE9a00",
    borderBottomWidth:1,
  },
  buttons: {
    borderRadius:3,
    borderWidth:0,
    borderBottomWidth:1,
    borderBottomColor:"#AE9A00",
    backgroundColor:"#fefff8",
  }
});

export default VisitationDataPage;
