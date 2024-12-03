import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Sidebar = ({ navigation, userName, userPhoto, onClose, onLogout, slideAnim }) => {
  return (
    <Animated.View style={[
      styles.sidebarContainer,
      {
        transform: [{ translateX: slideAnim }],
      }
    ]}>
    
      <View style={styles.userInfo}>
        <Image source={{ uri: userPhoto }} style={styles.userPhoto} />
        <Text style={styles.userName}>{userName}</Text>
      </View>
      <View style={styles.menuItems}>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => {
            navigation.navigate('Home');
            onClose();
          }}
        >
          <Ionicons name="home-outline" size={24} color="#333" />
          <Text style={styles.sidebarText}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => {
            navigation.navigate('ControlerScreen');
            onClose();
          }}
        >
          <Ionicons name="list-outline" size={24} color="#333" />
          <Text style={styles.sidebarText}>Ver Todos</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.sidebarItem}
          onPress={() => {
            navigation.navigate('AjusteScreen');
            onClose();
          }}
        >
          <Ionicons name="settings-outline" size={24} color="#333" />
          <Text style={styles.sidebarText}>Ajustes</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={24} color="white" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sidebarContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '60%',
    maxWidth: 300,
    backgroundColor: 'white',
    paddingTop: 50,
    paddingHorizontal: 20,
    zIndex: 1000,
    height: '100%',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1001,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingBottom: 20,
  },
  userPhoto: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  menuItems: {
    flex: 1,
    justifyContent: 'flex-start',
    marginTop: 20,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sidebarText: {
    marginLeft: 15,
    fontSize: 18,
    color: '#333',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  logoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default Sidebar;

