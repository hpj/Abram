import React from 'react';

import { StyleSheet, View } from 'react-native';

import Animated from 'react-native-reanimated';

const {
  set, cond, eq, add, sub, spring,
  startClock, stopClock, clockRunning,
  defined, Value, Clock, event
} = Animated;

import { PanGestureHandler, State } from 'react-native-gesture-handler';

function runSpring(clock, value, velocity, dest)
{
  const state = {
    finished: new Value(0),
    velocity: new Value(0),
    position: new Value(0),
    time: new Value(0)
  };
  
  const config = {
    damping: 7,
    mass: 1,
    stiffness: 121.6,
    overshootClamping: false,
    restSpeedThreshold: 0.001,
    restDisplacementThreshold: 0.001,
    toValue: new Value(0)
  };
  
  return [
    cond(clockRunning(clock), 0, [
      set(state.finished, 0),
      set(state.velocity, velocity),
      set(state.position, value),
      set(config.toValue, dest),
      startClock(clock)
    ]),
    spring(clock, state, config),
    cond(state.finished, stopClock(clock)),
    state.position
  ];
}

class Interactable extends React.Component
{
  constructor()
  {
    super();

    // const startSpot = { y: 100 };
    // const snapPoints = [ { y: 100 }, { y: 700 } ];

    const state = new Value(-1);

    const [ dragX, dragY ]  = [ new Value(0), new Value(0) ];

    /** PanGestureHandler uses this event to update our Animated.Value
    * based on the gesture the user made
    */
    this.onGestureEvent = event([
      {
        nativeEvent: {
          translationX: dragX,
          // translationY: dragY,
          state: state
        }
      }
    ]);

    const [ clockX, clockY ] = [ new Clock(), new Clock() ];

    const [ transX, transY ] = [ new Value(0), new Value(0) ];

    const snapStartX = () =>
    {
    };

    this.translateX = new Value(0);

    this.translateY = new Value(0);

    this.translateX = cond(
      eq(state, State.ACTIVE), [
        // active
        stopClock(clockX),
        set(transX, dragX),
        transX
      ], [
        // inactive
        set(transX, cond(
          defined(transX),
          runSpring(clockX, transX, 0, 0),
          0
        ))
      ]
    );

    // this.translateY = cond(
    //   eq(state, State.ACTIVE), [
    //     // active
    //     stopClock(clockY),
    //     set(transY, dragY),
    //     transY
    //   ], [
    //     // inactive
    //     set(transY, cond(
    //       defined(transY),
    //       runSpring(clockY, transY, 0, 0),
    //       0
    //     ))
    //   ]
    // );
  }

  render()
  {
    return (
      <View style={ styles.container }>

        <PanGestureHandler
          maxPointers={ 1 }
          onGestureEvent={ this.onGestureEvent }
          onHandlerStateChange={ this.onGestureEvent }
        >
          <Animated.View style={ {
            ...styles.box,
            transform: [
              { translateX: this.translateX },
              { translateY: this.translateY }
            ]
          } }/>
        </PanGestureHandler>

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'brown'
  },

  box: {
    width: 100,
    height: 100,
    backgroundColor: 'red'
  }
});

export default Interactable;
