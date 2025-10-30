import React, { useRef, useEffect } from 'react';
import { StyleSheet } from 'react-native';
import PagerView from 'react-native-pager-view';

interface SwipeableScreensProps {
    children: React.ReactNode[];
    currentIndex: number;
    onPageChange: (index: number) => void;
}

export const SwipeableScreens: React.FC<SwipeableScreensProps> = ({
    children,
    currentIndex,
    onPageChange,
}) => {
    const pagerRef = useRef<PagerView>(null);
    const lastIndexRef = useRef(currentIndex);

    useEffect(() => {
        if (lastIndexRef.current !== currentIndex) {
            pagerRef.current?.setPage(currentIndex);
            lastIndexRef.current = currentIndex;
        }
    }, [currentIndex]);

    const handlePageSelected = (e: any) => {
        const newIndex = e.nativeEvent.position;
        if (newIndex !== currentIndex) {
            lastIndexRef.current = newIndex;
            onPageChange(newIndex);
        }
    };

    return (
        <PagerView
            ref={pagerRef}
            style={styles.container}
            initialPage={currentIndex}
            onPageSelected={handlePageSelected}
            overdrag={false}
        >
            {children}
        </PagerView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
