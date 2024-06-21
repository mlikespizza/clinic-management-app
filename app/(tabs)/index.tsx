import { useCallback, useEffect, useState } from "react";
import { Alert, Image, StyleSheet, Text, View, ScrollView } from "react-native"
import { TextInput, Button } from 'react-native-paper';
import { DatePickerModal } from "react-native-paper-dates";
import * as SQLite from 'expo-sqlite';

const PatientRegistrationPage: React.FC = () => {
  const [db,setDb] = useState<any>()
  const [date, setDate] = useState("");
  const [open, setOpen] = useState(false);
  const [firstName, setfirstName] = useState<string>("");
  const [surName, setsurName] = useState<string>("");
  const [middleName, setmiddleName] = useState<string>("");
  const [homeAddress, sethomeAddress] = useState<string>("");



  const onDismissSingle = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const onConfirmSingle = useCallback(
    (params) => {
      setOpen(false);
      console.log(params.date.toLocaleDateString());

      setDate(params.date.toLocaleDateString());
    },
    [setOpen, setDate]

  );

  const initializeDatabase = async () => {
    const db = await SQLite.openDatabaseAsync("marvClinic.db");
    console.log(db);
    setDb(db)
    
 db.execAsync(`
      CREATE TABLE IF NOT EXISTS patients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT,
      surname TEXT,
      middle_name TEXT,
      DOB DATE,
      home_address TEXT
      );
      `);
  };


  const submitDetailsHandler = async () => {
    if (firstName !== "" || surName !== "" || middleName !== "" || date !== "" || homeAddress !== "") {
      console.log(firstName, surName, middleName, date, homeAddress);
      const db = await SQLite.openDatabaseAsync("marvClinic.db");
      console.log(db);
      

      try {
        await db.runAsync(
          `INSERT INTO patients (first_name, surname, middle_name, DOB, home_address) VALUES(?, ?, ?, ?, ?)`,
          [firstName, surName, middleName, date, homeAddress]
        );
        setfirstName("");
        sethomeAddress("");
        setDate("");
        setmiddleName("");
        setsurName("");
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

  useEffect(() => {
    initializeDatabase();
    // getAllRecords()
  }, []);

  const getAllRecords = async () => {
    const db = await SQLite.openDatabaseAsync("marvClinic.db");
    const allPatientData = await db.getAllAsync("SELECT * FROM patients");
    console.log(allPatientData);

  };

  return (
    <View style={{ paddingHorizontal: 30, paddingTop: 40, backgroundColor: "#fff", gap: 10, flex: 1 }}>
      <Image resizeMode="contain" style={{ height: 75, width: "auto" }} source={require('../../assets/images/hospitallogo-removebg-preview.png')} />
      <Text style={{ color: "#000", fontSize: 20 }}>Hello,</Text>
      <Text style={{ color: "#000" }}>Please input patient details</Text>
      <TextInput value={firstName} label="Firstname" style={styles.textInput} onChangeText={(name) => setfirstName(name)} />
      <TextInput value={surName} label="Surname" style={styles.textInput} onChangeText={(surname) => setsurName(surname)} />
      <TextInput value={middleName} label="Middlename" style={styles.textInput} onChangeText={(middleName) => setmiddleName(middleName)} />
      <Button style={styles.buttons} textColor="#ccc" onPress={() => setOpen(true)} uppercase={false} mode="outlined">
        {date !== "" ? date : "Input Date of Birth"}
      </Button>
      <DatePickerModal
        locale="en"
        mode="single"
        visible={open}
        onDismiss={onDismissSingle}
        date={date}
        onConfirm={onConfirmSingle}
      />
      <TextInput value={homeAddress} label="Home Address" multiline style={[styles.textInput, { marginBottom: 20 }]} onChangeText={(home) => sethomeAddress(home)} />
      <Button style={{ backgroundColor: "#FDE74C" }} icon="check" mode="contained" onPress={submitDetailsHandler}>
        Press me
      </Button>
    </View>

  );

};

const styles = StyleSheet.create({
  textInput: {
    // marginVertical: 10,
    // backgroundColor: "#FCF8DF"
    backgroundColor: "#fefff8",
    borderWidth: 0,
    borderBottomColor: "#AE9a00",
    borderBottomWidth: 1,

  },
  buttons: {
    borderRadius: 3,
    borderWidth: 0,
    borderBottomWidth: 1,
    borderBottomColor: "#AE9A00",

    backgroundColor: "#fefff8",
  }
})

export default PatientRegistrationPage;